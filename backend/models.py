"""Pydantic request/response models."""

from pydantic import BaseModel
from typing import Optional


class RunRequest(BaseModel):
    url: str
    # task_type selects the hardcoded template; ignored if not matching a known template
    task_type: str = "everything"
    # Optional context about the business (scraped data) injected into the prompt
    context: Optional[str] = None
    # model is ignored — backend uses hardcoded model
    model: Optional[str] = None


class RunResponse(BaseModel):
    job_id: str
    status: str
    mjpeg_url: str
    events_ws_url: str
    created_at: str


class StatusResponse(BaseModel):
    job_id: str
    status: str
    step_count: int
    created_at: Optional[str] = None
    started_at: Optional[str] = None
    finished_at: Optional[str] = None


class RateLimitResponse(BaseModel):
    error: str
    retry_after_seconds: int
    message: str
