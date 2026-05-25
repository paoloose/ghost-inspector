"""Job registry with in-memory state + SQLite persistence."""

from __future__ import annotations

import asyncio
import json
import sqlite3
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


@dataclass
class Job:
    """Represents a single agent job with runtime queues."""

    id: str
    url: str
    task: str
    model: Optional[str] = None
    status: str = "pending"  # pending | running | done | error
    result: Optional[str] = None
    error_reason: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    total_steps: int = 0

    # Fan-out subscribers (one queue per connected client)
    _mjpeg_subs: List[asyncio.Queue] = field(default_factory=list, repr=False)
    _events_subs: List[asyncio.Queue] = field(default_factory=list, repr=False)

    # -- MJPEG fan-out --
    def subscribe_mjpeg(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=2)
        self._mjpeg_subs.append(q)
        return q

    async def publish_mjpeg(self, frame: bytes) -> None:
        for q in self._mjpeg_subs:
            try:
                q.put_nowait(frame)
            except asyncio.QueueFull:
                pass

    async def end_mjpeg(self) -> None:
        for q in self._mjpeg_subs:
            try:
                q.put_nowait(None)
            except asyncio.QueueFull:
                pass

    # -- Events fan-out --
    def subscribe_events(self) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue()
        self._events_subs.append(q)
        return q

    async def publish_event(self, event: dict) -> None:
        for q in self._events_subs:
            try:
                q.put_nowait(event)
            except asyncio.QueueFull:
                pass

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "url": self.url,
            "task": self.task,
            "model": self.model,
            "status": self.status,
            "result": self.result,
            "error_reason": self.error_reason,
            "created_at": self.created_at.isoformat() + "Z" if self.created_at else None,
            "started_at": self.started_at.isoformat() + "Z" if self.started_at else None,
            "finished_at": self.finished_at.isoformat() + "Z" if self.finished_at else None,
            "total_steps": self.total_steps,
        }


class JobManager:
    """In-memory job registry backed by SQLite."""

    instance: Optional["JobManager"] = None

    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.jobs: Dict[str, Job] = {}
        self._last_job_time: Optional[datetime] = None
        JobManager.instance = self

    # -- Rate limit --
    def can_start(self) -> tuple[bool, int]:
        if self._last_job_time is None:
            return True, 0
        elapsed = (datetime.utcnow() - self._last_job_time).total_seconds()
        if elapsed >= 20:
            return True, 0
        return False, int(20 - elapsed)

    # -- CRUD --
    def register(self, job: Job) -> None:
        self.jobs[job.id] = job
        self._last_job_time = datetime.utcnow()
        self._save_job_sync(job)

    def get(self, job_id: str) -> Optional[Job]:
        return self.jobs.get(job_id)

    def update_status(self, job_id: str, status: str) -> None:
        job = self.jobs.get(job_id)
        if not job:
            return
        job.status = status
        if status == "running" and job.started_at is None:
            job.started_at = datetime.utcnow()
        if status in ("done", "error"):
            job.finished_at = datetime.utcnow()
        self._save_job_sync(job)

    def save_step(self, job_id: str, step_number: int, thought: str, action: str, action_details: dict, url: str) -> None:
        job = self.jobs.get(job_id)
        if not job:
            return
        job.total_steps = max(job.total_steps, step_number)
        self._insert_step_sync(job_id, step_number, thought, action, action_details, url)
        self._update_total_steps_sync(job_id, job.total_steps)

    def set_result(self, job_id: str, result: str | None, error: str | None = None) -> None:
        job = self.jobs.get(job_id)
        if not job:
            return
        job.result = result
        job.error_reason = error
        self._save_job_sync(job)

    # -- SQLite sync wrappers (fire-and-forget via asyncio.to_thread) --
    def _save_job_sync(self, job: Job) -> None:
        def _do():
            conn = sqlite3.connect(str(self.db_path))
            conn.execute(
                """
                INSERT OR REPLACE INTO jobs
                (id, url, task, model, status, result, error_reason, created_at, started_at, finished_at, total_steps)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job.id,
                    job.url,
                    job.task,
                    job.model,
                    job.status,
                    job.result,
                    job.error_reason,
                    job.created_at.isoformat() if job.created_at else None,
                    job.started_at.isoformat() if job.started_at else None,
                    job.finished_at.isoformat() if job.finished_at else None,
                    job.total_steps,
                ),
            )
            conn.commit()
            conn.close()

        asyncio.create_task(asyncio.to_thread(_do))

    def _insert_step_sync(self, job_id: str, step_number: int, thought: str, action: str, action_details: dict, url: str) -> None:
        def _do():
            conn = sqlite3.connect(str(self.db_path))
            conn.execute(
                """
                INSERT INTO job_steps (job_id, step_number, thought, action, action_details, url)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (job_id, step_number, thought, action, json.dumps(action_details), url),
            )
            conn.commit()
            conn.close()

        asyncio.create_task(asyncio.to_thread(_do))

    def _update_total_steps_sync(self, job_id: str, total_steps: int) -> None:
        def _do():
            conn = sqlite3.connect(str(self.db_path))
            conn.execute("UPDATE jobs SET total_steps = ? WHERE id = ?", (total_steps, job_id))
            conn.commit()
            conn.close()

        asyncio.create_task(asyncio.to_thread(_do))
