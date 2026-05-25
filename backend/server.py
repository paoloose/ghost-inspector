"""Starlette application: routes, CORS, lifespan."""

import asyncio
from contextlib import asynccontextmanager

from starlette.applications import Starlette
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from starlette.routing import Route, WebSocketRoute, Mount
from starlette.staticfiles import StaticFiles

from backend.config import API_HOST, API_PORT, DB_PATH, HARDCODED_MODEL, TASK_TEMPLATES
from backend.db import init_db
from backend.jobs import Job, JobManager
from backend.models import RunRequest
from backend.agent_runner import run_agent
from backend.mjpeg import mjpeg_endpoint
from backend.events import events_endpoint

_job_manager: JobManager | None = None


def _build_prompt(task_type: str, url: str, context: str | None) -> str:
    """Build agent prompt from hardcoded template + optional business context."""
    template = TASK_TEMPLATES.get(task_type, TASK_TEMPLATES["everything"])
    name = "Marco Antonio Herrera"
    email = "pflores.fisi22@gmail.com"
    phone = "+52 1 55 2567 5419"
    ctx = context or "No additional context provided."
    prompt = template.format(
        context=ctx,
        name=name,
        email=email,
        phone=phone,
    )
    # Force the agent to navigate to the exact URL first — do NOT search on Google
    return f"Navigate to this URL first: {url}\n\nOnce the page loads, follow these instructions:\n\n{prompt}"


@asynccontextmanager
async def lifespan(app: Starlette):
    global _job_manager
    await init_db(DB_PATH)
    _job_manager = JobManager(DB_PATH)
    yield
    # shutdown


async def run_endpoint(request):
    body = await request.json()
    req = RunRequest(**body)

    can_start, retry_after = _job_manager.can_start()
    if not can_start:
        return JSONResponse(
            {
                "error": "rate_limited",
                "retry_after_seconds": retry_after,
                "message": f"Global rate limit: 20 seconds between jobs. Retry after {retry_after}s.",
            },
            status_code=429,
        )

    # Build prompt from hardcoded template + context
    prompt = _build_prompt(req.task_type, req.url, req.context)

    job = Job(
        id=__import__("uuid").uuid4().hex,
        url=req.url,
        task=prompt,
        model=HARDCODED_MODEL,  # always hardcoded
    )
    _job_manager.register(job)

    # Launch agent in background
    asyncio.create_task(run_agent(job, _job_manager))

    return JSONResponse(
        {
            "job_id": job.id,
            "status": "running",
            # Relative paths — frontend constructs full URLs from window.location
            "mjpeg_url": f"/mjpeg/v1/watch/{job.id}",
            "events_ws_url": f"/ws/v1/events/{job.id}",
            "created_at": job.created_at.isoformat() + "Z",
        }
    )


async def status_endpoint(request):
    job_id = request.path_params["job_id"]
    job = _job_manager.get(job_id)
    if not job:
        return JSONResponse({"error": "Job not found"}, status_code=404)

    return JSONResponse({
        "job_id": job.id,
        "status": job.status,
        "step_count": job.total_steps,
        "created_at": job.created_at.isoformat() + "Z" if job.created_at else None,
        "started_at": job.started_at.isoformat() + "Z" if job.started_at else None,
        "finished_at": job.finished_at.isoformat() + "Z" if job.finished_at else None,
    })


routes = [
    Route("/api/v1/run", run_endpoint, methods=["POST"]),
    Route("/api/v1/status/{job_id}", status_endpoint, methods=["GET"]),
    Route("/mjpeg/v1/watch/{job_id}", mjpeg_endpoint, methods=["GET"]),
    WebSocketRoute("/ws/v1/events/{job_id}", events_endpoint),
    # Serve built React SPA; html=True handles SPA routing (fallback to index.html)
    Mount("/", app=StaticFiles(directory="admin-dashboard/dist", html=True), name="static"),
]

app = Starlette(
    debug=True,
    routes=routes,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)
