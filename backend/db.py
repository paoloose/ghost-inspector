"""SQLite database init and helpers (uses stdlib sqlite3 + asyncio.to_thread)."""

import asyncio
import sqlite3
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    task TEXT NOT NULL,
    model TEXT,
    status TEXT DEFAULT 'pending',
    result TEXT,
    error_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    total_steps INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS job_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT REFERENCES jobs(id),
    step_number INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    thought TEXT,
    action TEXT,
    action_details TEXT,
    url TEXT
);
"""


def _init_sync(db_path: Path) -> None:
    conn = sqlite3.connect(str(db_path))
    conn.executescript(SCHEMA)
    conn.commit()
    conn.close()


async def init_db(db_path: Path) -> None:
    await asyncio.to_thread(_init_sync, db_path)
