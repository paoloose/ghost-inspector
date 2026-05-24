"""MJPEG streaming endpoint (multipart/x-mixed-replace)."""

import asyncio

from starlette.responses import StreamingResponse

from backend.jobs import JobManager


async def _mjpeg_generator(job):
    """Yield JPEG frames in multipart/x-mixed-replace format."""
    queue = job.subscribe_mjpeg()
    while True:
        frame = await queue.get()
        if frame is None:
            break
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        )


async def mjpeg_endpoint(request):
    job_id = request.path_params["job_id"]
    job = JobManager.instance.get(job_id)

    if not job:
        return StreamingResponse(iter([b"Not Found"]), status_code=404)

    if job.status in ("done", "error"):
        return StreamingResponse(iter([b"Gone"]), status_code=410)

    return StreamingResponse(
        _mjpeg_generator(job),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )
