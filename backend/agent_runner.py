"""Wrap browser_use.Agent: CDP screencast → MJPEG + step polling → events."""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import traceback
from datetime import datetime
from typing import TYPE_CHECKING

from PIL import Image

from browser_use import Agent, BrowserSession, ChatOpenAI

from backend.config import (
    HARDCODED_MODEL,
    HEADLESS,
    OPENCODEGO_API_KEY,
    OPENCODEGO_BASE_URL,
)

if TYPE_CHECKING:
    from backend.jobs import Job, JobManager

logger = logging.getLogger("backend.agent_runner")


# ---------------------------------------------------------------------------
# CDP screencast helpers (adapted from test.py)
# ---------------------------------------------------------------------------


async def _ack_frame(browser_session, session_id: str, cdp_session_id: str | None) -> None:
    try:
        await browser_session.cdp_client.send.Page.screencastFrameAck(
            params={"sessionId": session_id},
            session_id=cdp_session_id,
        )
    except Exception:
        pass


async def start_screencast(browser_session, job: "Job") -> None:
    """Start CDP screencast and publish JPEG frames to the job's MJPEG subscribers."""
    cdp_session = await browser_session.get_or_create_cdp_session()
    metrics = await cdp_session.cdp_client.send.Page.getLayoutMetrics(
        session_id=cdp_session.session_id
    )
    viewport = metrics.get("cssVisualViewport", {})
    width = viewport.get("clientWidth", 1280)
    height = viewport.get("clientHeight", 720)

    logger.info(f"[job:{job.id[:8]}] Starting screencast at {width}x{height}")

    def on_frame(event, _session_id):
        try:
            png_bytes = base64.b64decode(event["data"])
            with Image.open(io.BytesIO(png_bytes)) as img:
                img = img.convert("RGB")
                buf = io.BytesIO()
                img.save(buf, format="JPEG", quality=85)
                jpeg = buf.getvalue()
                # Fire-and-forget publish
                asyncio.get_event_loop().call_soon_threadsafe(
                    lambda: asyncio.create_task(job.publish_mjpeg(jpeg))
                )
            asyncio.create_task(_ack_frame(browser_session, event["sessionId"], _session_id))
        except Exception as exc:
            logger.warning(f"Frame processing error: {exc}")

    browser_session.cdp_client.register.Page.screencastFrame(on_frame)

    await cdp_session.cdp_client.send.Page.startScreencast(
        params={
            "format": "png",
            "quality": 90,
            "maxWidth": width,
            "maxHeight": height,
            "everyNthFrame": 1,
        },
        session_id=cdp_session.session_id,
    )


# ---------------------------------------------------------------------------
# Step extraction from agent history
# ---------------------------------------------------------------------------

def _extract_step_info(agent, step_index: int) -> dict | None:
    """Extract step info from agent history at the given index."""
    history = getattr(agent, "history", None)
    if not history:
        logger.debug("_extract_step_info: no history attribute")
        return None

    try:
        hist_len = len(history)
        if hist_len == 0 or step_index >= hist_len:
            return None
        entry = history[step_index]
    except Exception as exc:
        logger.debug(f"_extract_step_info: history access error: {exc}")
        return None

    thought = ""
    action = ""
    action_details: dict = {}
    url = ""

    # Try multiple access patterns for browser_use's AgentHistory object
    try:
        # Pattern 1: model_output.current_state (browser_use >= 0.12)
        if hasattr(entry, "model_output") and entry.model_output:
            mo = entry.model_output
            if hasattr(mo, "current_state") and mo.current_state:
                cs = mo.current_state
                thought = getattr(cs, "evaluation_previous_goal", "") or getattr(cs, "memory", "") or ""
            if hasattr(mo, "action") and mo.action:
                acts = mo.action
                if acts and len(acts) > 0:
                    first = acts[0]
                    if hasattr(first, "model_dump"):
                        action_details = first.model_dump()
                    elif isinstance(first, dict):
                        action_details = first
                    else:
                        action_details = {"raw": str(first)}
                    action = action_details.get("type", str(action_details)[:80])

        # Pattern 2: direct dict access
        elif isinstance(entry, dict):
            thought = entry.get("thought", "") or entry.get("memory", "")
            action_details = entry.get("action", {})
            action = action_details.get("type", str(action_details)[:80]) if isinstance(action_details, dict) else str(action_details)[:80]

        # Pattern 3: fallback — try to get anything useful
        else:
            attrs = [a for a in dir(entry) if not a.startswith("_")]
            logger.debug(f"_extract_step_info: unknown entry type, attrs={attrs}")
            thought = str(entry)[:200]

        # Extract URL from state
        if hasattr(entry, "state") and entry.state:
            st = entry.state
            url = getattr(st, "url", "") or ""
        elif isinstance(entry, dict):
            url = entry.get("state", {}).get("url", "") if isinstance(entry.get("state"), dict) else ""

    except Exception as exc:
        logger.warning(f"_extract_step_info: extraction error: {exc}")
        logger.debug(traceback.format_exc())
        # Still return something so we emit an event
        thought = f"(extraction error: {exc})"

    return {
        "step_number": step_index + 1,
        "thought": thought or "(no thought extracted)",
        "action": action or "(no action extracted)",
        "action_details": action_details,
        "url": url,
    }


def _get_history_length(agent) -> int:
    """Safely get the length of agent history."""
    history = getattr(agent, "history", None)
    if history is None:
        return 0
    try:
        return len(history)
    except Exception:
        return 0


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------


async def run_agent(job: "Job", job_manager: "JobManager") -> None:
    """Launch the browser, start screencast, run the agent, and publish events."""
    browser: BrowserSession | None = None

    try:
        browser = BrowserSession(headless=HEADLESS)
        await browser.start()

        # 1. Start screencast (pushes JPEG frames to job subscribers)
        await start_screencast(browser, job)

        # 2. Build LLM + Agent
        llm = ChatOpenAI(
            model=job.model or HARDCODED_MODEL,
            api_key=OPENCODEGO_API_KEY,
            base_url=OPENCODEGO_BASE_URL,
            max_completion_tokens=8192,
        )

        logger.info(f"[job:{job.id[:8]}] Creating agent with task ({len(job.task)} chars)")
        logger.debug(f"[job:{job.id[:8]}] Task preview: {job.task[:200]}...")

        agent = Agent(
            task=job.task,
            llm=llm,
            browser_session=browser,
        )

        # 3. Mark running
        job_manager.update_status(job.id, "running")

        # 4. Run agent in background and poll steps
        agent_task = asyncio.create_task(agent.run())
        logger.info(f"[job:{job.id[:8]}] Agent task created, entering poll loop")

        last_hist_len = 0
        last_step_emitted = 0

        while not agent_task.done():
            await asyncio.sleep(0.5)

            # Poll history length — this is the reliable way to detect steps
            current_hist_len = _get_history_length(agent)

            if current_hist_len > last_hist_len:
                logger.info(f"[job:{job.id[:8]}] History grew: {last_hist_len} → {current_hist_len}")

                # Process each new history entry
                for idx in range(last_hist_len, current_hist_len):
                    info = _extract_step_info(agent, idx)
                    if info:
                        step_number = info.get("step_number", idx + 1)
                        thought = info.get("thought", "")
                        action = info.get("action", "")
                        action_details = info.get("action_details", {})
                        url = info.get("url", "")

                        last_step_emitted = step_number

                        # Persist to SQLite
                        job_manager.save_step(
                            job.id, step_number, thought, action, action_details, url
                        )

                        # Broadcast event
                        await job.publish_event({
                            "type": "step",
                            "step_number": step_number,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "thought": thought,
                            "action": action,
                            "action_details": action_details,
                            "url": url,
                        })
                        logger.info(f"[job:{job.id[:8]}] Published step {step_number}: {action[:60]}")
                    else:
                        # Even if extraction fails, emit a minimal step event
                        last_step_emitted = idx + 1
                        job_manager.save_step(
                            job.id, idx + 1, "(extraction failed)", "unknown", {}, ""
                        )
                        await job.publish_event({
                            "type": "step",
                            "step_number": idx + 1,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "thought": "",
                            "action": "unknown",
                            "action_details": {},
                            "url": "",
                        })

                last_hist_len = current_hist_len

        # 5. Agent finished — process any remaining history entries
        final_hist_len = _get_history_length(agent)
        if final_hist_len > last_hist_len:
            logger.info(f"[job:{job.id[:8]}] Processing {final_hist_len - last_hist_len} final history entries")
            for idx in range(last_hist_len, final_hist_len):
                info = _extract_step_info(agent, idx)
                if info:
                    step_number = info.get("step_number", idx + 1)
                    job_manager.save_step(
                        job.id, step_number,
                        info.get("thought", ""),
                        info.get("action", ""),
                        info.get("action_details", {}),
                        info.get("url", ""),
                    )
                    await job.publish_event({
                        "type": "step",
                        "step_number": step_number,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "thought": info.get("thought", ""),
                        "action": info.get("action", ""),
                        "action_details": info.get("action_details", {}),
                        "url": info.get("url", ""),
                    })

        result = await agent_task
        logger.info(f"[job:{job.id[:8]}] Agent finished with result: {str(result)[:200] if result else 'None'}")
        job_manager.set_result(job.id, str(result) if result else None)
        job_manager.update_status(job.id, "done")

        await job.publish_event({
            "type": "done",
            "success": True,
            "result": job.result,
            "total_steps": last_step_emitted,
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })

    except Exception as exc:
        logger.exception(f"[job:{job.id[:8]}] Agent failed")
        job_manager.set_result(job.id, None, str(exc))
        job_manager.update_status(job.id, "error")
        await job.publish_event({
            "type": "error",
            "reason": str(exc),
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })

    finally:
        if browser:
            try:
                await browser.stop()
            except Exception:
                pass
        # Signal end of MJPEG stream
        await job.end_mjpeg()
