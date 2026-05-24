"""Wrap browser_use.Agent: CDP screencast → MJPEG + step polling → events."""

from __future__ import annotations

import asyncio
import base64
import io
import json
import logging
import re
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
# Call service notifier
# ---------------------------------------------------------------------------

CALL_SERVICE_URL = "https://ghost-shopper-production.up.railway.app/bot/call"


async def _notify_call_service(job: "Job", phone_number: str) -> None:
    """POST extracted phone number to the Ghost Shopper call service."""
    try:
        import httpx
    except ImportError:
        logger.warning("httpx not available, skipping call service notification")
        return

    # Build context from the task — use the first 800 chars which contain the business info
    context = job.task[:800] if job.task else "No context available"

    payload = {
        "phone": phone_number,
        "context": context,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(CALL_SERVICE_URL, json=payload)
            resp.raise_for_status()
            logger.info(f"[job:{job.id[:8]}] Call service notified for {phone_number} -> {resp.status_code}")
    except Exception as exc:
        logger.warning(f"[job:{job.id[:8]}] Call service notification failed for {phone_number}: {exc}")


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

def _deep_dump(obj) -> dict | list | str | None:
    """Deep serialize any object to a JSON-friendly structure."""
    if obj is None:
        return None
    if isinstance(obj, (str, int, float, bool)):
        return obj
    if isinstance(obj, list):
        return [_deep_dump(x) for x in obj]
    if isinstance(obj, dict):
        return {k: _deep_dump(v) for k, v in obj.items()}
    # Pydantic v2: try JSON dump first (handles nested objects more reliably)
    if hasattr(obj, "model_dump_json"):
        try:
            return _deep_dump(json.loads(obj.model_dump_json()))
        except Exception:
            pass
    if hasattr(obj, "model_dump"):
        try:
            return _deep_dump(obj.model_dump())
        except Exception:
            pass
    if hasattr(obj, "dict"):
        try:
            return _deep_dump(obj.dict())
        except Exception:
            pass
    try:
        return {k: _deep_dump(v) for k, v in vars(obj).items() if not k.startswith("_")}
    except Exception:
        pass
    return str(obj)


def _get_nested(data: dict, path: str):
    """Safely get a dotted-path value from a dict."""
    val = data
    for key in path.split("."):
        if isinstance(val, dict):
            val = val.get(key)
        else:
            return None
    return val


def _extract_step_info(agent, step_index: int) -> dict | None:
    """Extract step info from agent history at the given index.

    Uses the documented browser-use helper methods first (action_names,
    model_thoughts, urls), then falls back to deep-serializing the entry.
    """
    history = getattr(agent, "history", None)
    if not history:
        return None

    try:
        if step_index >= len(history):
            return None
    except Exception:
        return None

    thought = ""
    action = ""
    action_details: dict = {}
    url = ""

    # ------------------------------------------------------------------
    # 1) Try documented AgentHistoryList helper methods (most reliable)
    # ------------------------------------------------------------------
    if hasattr(history, "action_names"):
        try:
            names = history.action_names()
            if step_index < len(names) and names[step_index]:
                action = str(names[step_index])
                logger.info(f"_extract_step_info [{step_index}] action from history.action_names()={action!r}")
        except Exception as exc:
            logger.debug(f"action_names() failed: {exc}")

    if hasattr(history, "model_thoughts"):
        try:
            thoughts = history.model_thoughts()
            if step_index < len(thoughts) and thoughts[step_index] is not None:
                # model_thoughts() returns AgentBrain objects — stringify them
                t = thoughts[step_index]
                if hasattr(t, "evaluation_previous_goal"):
                    thought = (
                        getattr(t, "evaluation_previous_goal", "") or
                        getattr(t, "memory", "") or
                        getattr(t, "thought", "") or
                        getattr(t, "reasoning", "") or
                        getattr(t, "next_goal", "") or
                        str(t)
                    )
                else:
                    thought = str(t)
                logger.info(f"_extract_step_info [{step_index}] thought from history.model_thoughts()={thought[:60]!r}")
        except Exception as exc:
            logger.debug(f"model_thoughts() failed: {exc}")

    if hasattr(history, "urls"):
        try:
            urls = history.urls()
            if step_index < len(urls) and urls[step_index]:
                url = str(urls[step_index])
        except Exception as exc:
            logger.debug(f"urls() failed: {exc}")

    if hasattr(history, "action_results"):
        try:
            results = history.action_results()
            if step_index < len(results) and results[step_index] is not None:
                r = results[step_index]
                dumped = _deep_dump(r)
                if isinstance(dumped, dict):
                    action_details = dumped
        except Exception as exc:
            logger.debug(f"action_results() failed: {exc}")

    # If helpers gave us everything, return early
    if action and thought:
        return {
            "step_number": step_index + 1,
            "thought": thought,
            "action": action,
            "action_details": action_details,
            "url": url,
        }

    # ------------------------------------------------------------------
    # 2) Fallback: deep-serialize the individual entry and walk the dict
    # ------------------------------------------------------------------
    try:
        entry = history[step_index]
        d = _deep_dump(entry)

        if isinstance(d, dict):
            # Log the FULL raw structure for first 2 steps so we can inspect it
            if step_index < 2:
                logger.info(f"_extract_step_info [{step_index}] FULL DUMP:\n{json.dumps(d, default=str, indent=2)[:2000]}")

            # -- Thought --
            for path in [
                "model_output.current_state.evaluation_previous_goal",
                "model_output.current_state.memory",
                "model_output.current_state.thought",
                "model_output.current_state.reasoning",
                "model_output.current_state.next_goal",
                "model_output.text",
                "model_output.thought",
                "model_output.content",
                "result.extracted_content",
                "result.text",
                "thought",
                "memory",
            ]:
                val = _get_nested(d, path)
                if val and isinstance(val, str) and val.strip():
                    thought = val.strip()
                    logger.info(f"  thought found at {path}={thought[:60]!r}")
                    break

            # -- Action --
            mo_action = _get_nested(d, "model_output.action")
            if mo_action is not None:
                if isinstance(mo_action, list) and len(mo_action) > 0:
                    first = mo_action[0]
                    if isinstance(first, dict):
                        action_details = first
                        action = first.get("type", "")
                        if not action:
                            parts = [f"{k}={str(v)[:30]}" for k, v in first.items()
                                     if k not in ("type", "model_config") and v is not None]
                            action = f"action({', '.join(parts[:2])})" if parts else "action"
                        logger.info(f"  action from model_output.action[0].type={action!r}")
                elif isinstance(mo_action, dict):
                    action_details = mo_action
                    action = mo_action.get("type", "")
                    logger.info(f"  action from model_output.action.type={action!r}")

            if not action:
                # Search recursively for any "type" key
                def _find_type(obj, depth=0):
                    if depth > 5:
                        return ""
                    if isinstance(obj, dict):
                        if "type" in obj and isinstance(obj["type"], str) and obj["type"]:
                            return obj["type"]
                        for v in obj.values():
                            t = _find_type(v, depth + 1)
                            if t:
                                return t
                    elif isinstance(obj, list):
                        for item in obj:
                            t = _find_type(item, depth + 1)
                            if t:
                                return t
                    return ""
                action = _find_type(d)
                if action:
                    logger.info(f"  action found by recursive search={action!r}")

            # -- URL --
            for path in ["state.url", "state.page.url", "url"]:
                val = _get_nested(d, path)
                if val and isinstance(val, str):
                    url = val
                    break

        else:
            logger.warning(f"_extract_step_info [{step_index}] entry is not a dict after dump: {type(d).__name__}")

    except Exception as exc:
        logger.warning(f"_extract_step_info [{step_index}] deep-serialize failed: {exc}")

    # ------------------------------------------------------------------
    # 3) Final fallback: repr() regex
    # ------------------------------------------------------------------
    if not thought or not action:
        try:
            rep = repr(history[step_index])
            if not thought:
                m = re.search(r"evaluation_previous_goal='([^']{5,500})'", rep)
                if m:
                    thought = m.group(1)
            if not action:
                m = re.search(r"type='([^']+)'", rep)
                if m:
                    action = m.group(1)
        except Exception:
            pass

    result = {
        "step_number": step_index + 1,
        "thought": thought or "(no thought extracted)",
        "action": action or "unknown",
        "action_details": action_details,
        "url": url,
    }
    logger.info(f"_extract_step_info [{step_index}] FINAL -> action={action!r}, thought={thought[:80]!r}, url={url!r}")
    return result


def _scan_for_tool_calls(text: str) -> list[dict]:
    """Scan agent output text for extracted contact info and return tool_call events."""
    tool_calls = []

    # General Mexican phone numbers (including raw digits)
    phone_pattern = r"(\+?52[\s\d\-\(\)\.]{8,18})"
    seen = set()
    for match in re.finditer(phone_pattern, text):
        number = re.sub(r"[\s\(\)\.\-]", "", match.group(1)).strip()
        if len(number) >= 10 and number not in seen:
            seen.add(number)
            tool_calls.append({"tool": "extract_phone", "number": number})

    # WhatsApp numbers — wa.me links or explicit WhatsApp mentions
    wa_link_pattern = r"wa\.me/(\+?\d{10,15})"
    wa_text_pattern = r"whatsapp(?:[^\n]{0,40})(\+?52[\s\d\-\(\)\.]{8,18})"
    for match in re.finditer(wa_link_pattern, text, re.IGNORECASE):
        number = match.group(1).strip()
        if number not in seen:
            seen.add(number)
            tool_calls.append({"tool": "extract_whatsapp", "number": number})
    for match in re.finditer(wa_text_pattern, text, re.IGNORECASE):
        number = re.sub(r"[\s\(\)\.\-]", "", match.group(1)).strip()
        if number not in seen:
            seen.add(number)
            tool_calls.append({"tool": "extract_whatsapp", "number": number})

    # Email patterns
    email_pattern = r"([\w\.\-]+@[\w\.\-]+\.[a-zA-Z]{2,})"
    seen_emails = set()
    for match in re.finditer(email_pattern, text):
        email = match.group(1).strip()
        if email not in seen_emails:
            seen_emails.add(email)
            tool_calls.append({"tool": "extract_email", "email": email})

    return tool_calls


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


async def _get_browser_url(browser_session) -> str:
    """Try to get the current page URL from the browser session."""
    try:
        if hasattr(browser_session, "page") and browser_session.page:
            return getattr(browser_session.page, "url", "") or ""
        # Try CDP
        cdp = await browser_session.get_or_create_cdp_session()
        info = await cdp.cdp_client.send.Runtime.evaluate(
            params={"expression": "window.location.href", "returnByValue": True},
            session_id=cdp.session_id,
        )
        result = info.get("result", {})
        if result.get("type") == "string":
            return result.get("value", "")
    except Exception as exc:
        logger.debug(f"_get_browser_url failed: {exc}")
    return ""


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
            max_completion_tokens=4096,
        )

        logger.info(f"[job:{job.id[:8]}] Creating agent with task ({len(job.task)} chars)")
        logger.debug(f"[job:{job.id[:8]}] Task preview: {job.task[:200]}...")

        agent = Agent(
            task=job.task,
            llm=llm,
            browser_session=browser,
            max_steps=15,
            llm_timeout=60,
            step_timeout=60,
            use_thinking=False,
            flash_mode=True,
        )

        # 3. Mark running
        job_manager.update_status(job.id, "running")
        await job.publish_event({
            "type": "status",
            "status": "running",
            "message": "Agente iniciado y navegador listo",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        })

        # 4. Run agent in background and poll steps
        agent_task = asyncio.create_task(agent.run())
        logger.info(f"[job:{job.id[:8]}] Agent task created, entering poll loop")

        last_hist_len = 0
        last_step_emitted = 0
        last_known_url = ""
        last_action = ""
        url_poll_counter = 0
        first_step_diagnosed = False
        notified_numbers: set[str] = set()

        while not agent_task.done():
            await asyncio.sleep(0.5)
            url_poll_counter += 1

            # Poll history length — this is the reliable way to detect steps
            current_hist_len = _get_history_length(agent)

            # One-time diagnostic: dump the full history object structure when first step appears
            if not first_step_diagnosed and current_hist_len > 0:
                first_step_diagnosed = True
                try:
                    h = agent.history
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history type={type(h).__name__}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history has action_names={hasattr(h, 'action_names')}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history has model_thoughts={hasattr(h, 'model_thoughts')}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history has urls={hasattr(h, 'urls')}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history has action_results={hasattr(h, 'action_results')}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history has model_outputs={hasattr(h, 'model_outputs')}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC history len={len(h)}")
                    if hasattr(h, 'action_names'):
                        logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC action_names()={h.action_names()}")
                    if hasattr(h, 'model_thoughts'):
                        logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC model_thoughts()={[str(t)[:100] for t in h.model_thoughts()]}")
                    if hasattr(h, 'urls'):
                        logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC urls()={h.urls()}")
                    entry = h[0]
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC entry[0] type={type(entry).__name__}")
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC entry[0] attrs={[a for a in dir(entry) if not a.startswith('_')]}")
                    dumped = _deep_dump(entry)
                    logger.info(f"[job:{job.id[:8]}] DIAGNOSTIC entry[0] dump:\n{json.dumps(dumped, default=str, indent=2)[:3000]}")
                except Exception as diag_exc:
                    logger.warning(f"[job:{job.id[:8]}] DIAGNOSTIC failed: {diag_exc}")

            # Poll browser URL for url_change events (every 2s to avoid CDP overhead)
            if url_poll_counter % 4 == 0:
                try:
                    current_url = await _get_browser_url(browser)
                    if current_url and current_url != last_known_url:
                        logger.info(f"[job:{job.id[:8]}] URL changed: {last_known_url} -> {current_url}")
                        await job.publish_event({
                            "type": "url_change",
                            "url": current_url,
                            "previous_url": last_known_url,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                        })
                        last_known_url = current_url
                except Exception:
                    pass

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
                        url = info.get("url", "") or last_known_url

                        last_step_emitted = step_number
                        last_action = action

                        # Persist to SQLite
                        job_manager.save_step(
                            job.id, step_number, thought, action, action_details, url
                        )

                        # Broadcast step event
                        await job.publish_event({
                            "type": "step",
                            "step_number": step_number,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "thought": thought,
                            "action": action,
                            "action_details": action_details,
                            "url": url,
                        })
                        logger.info(f"[job:{job.id[:8]}] Published step {step_number}: {action[:80]}")

                        # Emit a separate thinking event if thought is substantial
                        if thought and len(thought) > 10 and not thought.startswith("("):
                            await job.publish_event({
                                "type": "thinking",
                                "step_number": step_number,
                                "timestamp": datetime.utcnow().isoformat() + "Z",
                                "thought": thought,
                            })

                        # Scan for extracted contacts and emit tool_call events
                        combined_text = f"{thought} {action} {json.dumps(action_details)}"
                        for tc in _scan_for_tool_calls(combined_text):
                            await job.publish_event({
                                "type": "tool_call",
                                "step_number": step_number,
                                "timestamp": datetime.utcnow().isoformat() + "Z",
                                "tool": tc["tool"],
                                "data": tc,
                            })
                            logger.info(f"[job:{job.id[:8]}] Tool call: {tc['tool']} -> {tc}")

                            # Notify call service for phone / whatsapp extractions
                            number = tc.get("number")
                            if number and tc["tool"] in ("extract_phone", "extract_whatsapp") and number not in notified_numbers:
                                notified_numbers.add(number)
                                await _notify_call_service(job, number)
                    else:
                        # Even if extraction fails, emit a minimal step event
                        last_step_emitted = idx + 1
                        job_manager.save_step(
                            job.id, idx + 1, "(extraction failed)", "unknown", {}, last_known_url
                        )
                        await job.publish_event({
                            "type": "step",
                            "step_number": idx + 1,
                            "timestamp": datetime.utcnow().isoformat() + "Z",
                            "thought": "",
                            "action": "unknown",
                            "action_details": {},
                            "url": last_known_url,
                        })

                last_hist_len = current_hist_len

            # Emit an "executing" event if we're on the same step for a while
            # This gives the client a sense of ongoing activity
            if last_action and last_step_emitted > 0:
                pass  # We could emit periodic status here if needed

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
                        info.get("url", "") or last_known_url,
                    )
                    await job.publish_event({
                        "type": "step",
                        "step_number": step_number,
                        "timestamp": datetime.utcnow().isoformat() + "Z",
                        "thought": info.get("thought", ""),
                        "action": info.get("action", ""),
                        "action_details": info.get("action_details", {}),
                        "url": info.get("url", "") or last_known_url,
                    })

        try:
            result = await asyncio.wait_for(agent_task, timeout=180)
        except asyncio.TimeoutError:
            logger.warning(f"[job:{job.id[:8]}] Agent run timed out after 180s")
            agent_task.cancel()
            try:
                await agent_task
            except asyncio.CancelledError:
                pass
            result = None
            job_manager.set_result(job.id, None, "Agent timed out after 180s")
            job_manager.update_status(job.id, "error")
            await job.publish_event({
                "type": "error",
                "reason": "La auditoría excedió el tiempo máximo (3 min). Intenta con un task type más específico.",
                "timestamp": datetime.utcnow().isoformat() + "Z",
            })
            return

        logger.info(f"[job:{job.id[:8]}] Agent finished with result: {str(result)[:200] if result else 'None'}")
        job_manager.set_result(job.id, str(result) if result else None)
        job_manager.update_status(job.id, "done")

        # Emit any final tool_calls from the result text
        if result:
            result_text = str(result)
            for tc in _scan_for_tool_calls(result_text):
                await job.publish_event({
                    "type": "tool_call",
                    "step_number": last_step_emitted,
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                    "tool": tc["tool"],
                    "data": tc,
                })

                # Notify call service for phone / whatsapp extractions
                number = tc.get("number")
                if number and tc["tool"] in ("extract_phone", "extract_whatsapp") and number not in notified_numbers:
                    notified_numbers.add(number)
                    await _notify_call_service(job, number)

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
