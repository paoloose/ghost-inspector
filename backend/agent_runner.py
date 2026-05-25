"""Wrap browser_use.Agent: CDP screencast → MJPEG + step polling → events."""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
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

def _extract_step_info(agent) -> dict | None:
    """Extract the latest step info from agent history."""
    history = getattr(agent, "history", None)
    if not history:
        return None

    # browser_use history is an AgentHistoryList or similar
    # We try to read the last item
    try:
        # Attempt 1: list-like access
        if hasattr(history, "__len__") and len(history) > 0:
            last = history[-1]
        else:
            return None
    except Exception:
        return None

    thought = ""
    action = ""
    action_details: dict = {}
    url = ""
    step_number = 0

    # last might be an AgentHistory object or dict
    if hasattr(last, "model_output") and last.model_output:
        mo = last.model_output
        if hasattr(mo, "current_state") and mo.current_state:
            cs = mo.current_state
            thought = getattr(cs, "evaluation_previous_goal", "") or getattr(cs, "memory", "") or ""
            step_number = getattr(cs, "step_number", 0) or 0
        if hasattr(mo, "action") and mo.action:
            acts = mo.action
            if acts and len(acts) > 0:
                first = acts[0]
                if hasattr(first, "model_dump"):
                    action_details = first.model_dump()
                elif isinstance(first, dict):
                    action_details = first
                action = action_details.get("type", str(action_details))

    if hasattr(last, "state") and last.state:
        st = last.state
        url = getattr(st, "url", "") or ""

    return {
        "step_number": step_number,
        "thought": thought,
        "action": action,
        "action_details": action_details,
        "url": url,
    }


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

        agent = Agent(
            task=job.task,
            llm=llm,
            browser_session=browser,
        )

        # 3. Mark running
        job_manager.update_status(job.id, "running")

        # 4. Run agent in background and poll steps
        agent_task = asyncio.create_task(agent.run())

        last_step = 0
        while not agent_task.done():
            await asyncio.sleep(0.5)

            # Poll current step count via agent.state.n_steps
            current_step = 0
            try:
                current_step = getattr(agent.state, "n_steps", 0) or 0
            except Exception:
                pass

            if current_step > last_step:
                # New step(s) detected – extract info
                for _ in range(last_step, current_step):
                    info = _extract_step_info(agent)
                    if info:
                        step_number = info.get("step_number", last_step + 1)
                        thought = info.get("thought", "")
                        action = info.get("action", "")
                        action_details = info.get("action_details", {})
                        url = info.get("url", "")

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

                last_step = current_step

        # 5. Agent finished
        result = await agent_task
        job_manager.set_result(job.id, str(result) if result else None)
        job_manager.update_status(job.id, "done")

        await job.publish_event({
            "type": "done",
            "success": True,
            "result": job.result,
            "total_steps": job.total_steps,
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
