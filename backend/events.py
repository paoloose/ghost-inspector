"""WebSocket events endpoint (fan-out from Job)."""

import asyncio
from datetime import datetime

from starlette.websockets import WebSocket, WebSocketDisconnect

from backend.jobs import JobManager


async def events_endpoint(websocket: WebSocket):
    await websocket.accept()

    job_id = websocket.path_params["job_id"]
    job = JobManager.instance.get(job_id)

    if not job:
        await websocket.send_json({"type": "error", "reason": "Job not found"})
        await websocket.close()
        return

    queue = job.subscribe_events()

    # Heartbeat coroutine
    async def heartbeat():
        while True:
            await asyncio.sleep(5)
            try:
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat() + "Z",
                })
            except (RuntimeError, Exception):
                break

    heartbeat_task = asyncio.create_task(heartbeat())

    try:
        while True:
            event = await queue.get()
            try:
                await websocket.send_json(event)
            except RuntimeError:
                # Socket already closed (client disconnected or prior close sent)
                break
            if event.get("type") in ("done", "error"):
                await websocket.close()
                break
    except WebSocketDisconnect:
        pass
    finally:
        heartbeat_task.cancel()
        try:
            await heartbeat_task
        except asyncio.CancelledError:
            pass
        job.unsubscribe_events(queue)
