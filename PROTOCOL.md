# Ghost Shopper — Backend Protocol v1

## Overview

The Ghost Shopper backend is an async orchestration layer built on **Starlette** + **uvicorn** that wraps `browser_use.Agent` and exposes:

- **MJPEG stream** of the live browser (CDP screencast)
- **WebSocket events** stream (agent thoughts, actions, progress)
- **HTTP API** to launch jobs and query status

All endpoints are CORS-enabled (`*` origins).

---

## Base URL

```
http://localhost:8001
```

---

## 1. Launch a Job

### `POST /api/v1/run`

**Request body:**
```json
{
  "url": "https://ramirezvazquez.paoloose.site",
  "task_type": "everything",
  "context": "Ramírez Vázquez Bienes Raíces es una agencia inmobiliaria...",
  "model": "kimi-k2.6"
}
```

- `url` *(required)* — the starting URL the agent should navigate to
- `task_type` *(optional)* — selects the hardcoded prompt template:
  - `"whatsapp"` — evaluate WhatsApp contact channels
  - `"forms"` — test all contact forms
  - `"call"` — audit phone number visibility and click-to-call
  - `"everything"` *(default)* — full Ghost Shopper audit
- `context` *(optional)* — scraped business info injected into the agent prompt
- `model` *(ignored)* — backend uses hardcoded `kimi-k2.6`

The backend builds the final agent prompt from `TASK_TEMPLATES[task_type]` with `{context}`, `{name}`, `{email}`, and `{phone}` variables injected.

**Success 200:**
```json
{
  "job_id": "550e8400e29b41d4a716446655440000",
  "status": "running",
  "mjpeg_url": "http://localhost:8001/mjpeg/v1/watch/550e8400e29b41d4a716446655440000",
  "events_ws_url": "ws://localhost:8001/ws/v1/events/550e8400e29b41d4a716446655440000",
  "created_at": "2025-05-23T18:30:00Z"
}
```

**Rate limit 429:**
```json
{
  "error": "rate_limited",
  "retry_after_seconds": 12,
  "message": "Global rate limit: 20 seconds between jobs. Retry after 12s."
}
```

---

## 2. Watch Live Browser — MJPEG

### `GET /mjpeg/v1/watch/{job_id}`

- **Content-Type:** `multipart/x-mixed-replace; boundary=frame`
- **Response:** Continuous JPEG frames from the browser CDP screencast (~5–10 fps)
- **End of stream:** The server closes the connection when the job reaches `done` or `error`
- **Gone:** If the job already finished, returns `410 Gone`

**Usage in HTML:**
```html
<img src="http://localhost:8001/mjpeg/v1/watch/{job_id}" />
```

> Note: Some browsers buffer MJPEG; for lowest latency use a dedicated viewer or the WebSocket events alongside.

---

## 3. Watch Agent Events — WebSocket

### `WS /ws/v1/events/{job_id}`

Connect via WebSocket to receive real-time JSON events.

### Server → Client messages

#### `step` — Agent completed a step
```json
{
  "type": "step",
  "step_number": 3,
  "timestamp": "2025-05-23T18:30:15.123Z",
  "thought": "I need to click the login button...",
  "action": "click",
  "action_details": {"index": 5, "xpath": "//button[@id='login']"},
  "url": "http://0.0.0.0:8000/login.html"
}
```

#### `heartbeat` — Keeps connection alive
Sent every **5 seconds** if no other events occurred.
```json
{"type": "heartbeat", "timestamp": "2025-05-23T18:30:20.000Z"}
```

#### `done` — Job finished successfully
```json
{
  "type": "done",
  "success": true,
  "result": "Successfully logged in...",
  "total_steps": 12,
  "timestamp": "2025-05-23T18:35:00.000Z"
}
```
The server closes the WebSocket after sending `done`.

#### `error` — Job failed
```json
{
  "type": "error",
  "reason": "Timeout waiting for element",
  "timestamp": "2025-05-23T18:35:00.000Z"
}
```
The server closes the WebSocket after sending `error`.

### Client → Server messages

None required for passive observation.

---

## 4. Query Job Status

### `GET /api/v1/status/{job_id}`

**Response 200:**
```json
{
  "job_id": "550e8400e29b41d4a716446655440000",
  "status": "running",
  "step_count": 7,
  "created_at": "2025-05-23T18:30:00Z",
  "started_at": "2025-05-23T18:30:02Z",
  "finished_at": null
}
```

**Response 404:** Job not found.

---

## Job Lifecycle

```
POST /api/v1/run
       │
       ▼
   ┌─────────┐
   │ pending │  ← registered in SQLite + memory
   └────┬────┘
        │ agent thread starts
        ▼
   ┌─────────┐     MJPEG stream     WebSocket events
   │ running │ ──────────────────►  clients connect
   └────┬────┘
        │
   ┌────┴────┐
   │  done   │  ← result saved, streams close
   └─────────┘

   OR

   ┌─────────┐
   │  error  │  ← error_reason saved, streams close
   └─────────┘
```

- Jobs are stored in **SQLite** (`jobs.db`) for persistence.
- In-memory `JobManager` holds active jobs and their queues.
- The MJPEG and WebSocket streams are **fan-out** — multiple clients can watch the same job simultaneously.

---

## Data Storage

### SQLite Schema

**`jobs`** table:
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID hex |
| url | TEXT | Starting URL |
| task | TEXT | Agent instructions |
| model | TEXT | Model ID used |
| status | TEXT | pending / running / done / error |
| result | TEXT | Final agent output |
| error_reason | TEXT | Exception message if failed |
| created_at | TIMESTAMP | UTC |
| started_at | TIMESTAMP | UTC |
| finished_at | TIMESTAMP | UTC |
| total_steps | INTEGER | Steps executed |

**`job_steps`** table:
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto-increment |
| job_id | TEXT FK | References jobs.id |
| step_number | INTEGER | Agent step index |
| timestamp | TIMESTAMP | UTC |
| thought | TEXT | Agent thought / evaluation |
| action | TEXT | Action type (click, type, etc.) |
| action_details | TEXT | JSON string |
| url | TEXT | Page URL at that step |

---

## Rate Limiting

- **Global cooldown:** 20 seconds between job launches (configurable in `backend.config.RATE_LIMIT_SECONDS`).
- If a client tries to launch a second job within the cooldown window, the API returns **429** with `retry_after_seconds`.

---

## Error Codes

| HTTP | Meaning |
|------|---------|
| 200 | OK |
| 404 | Job not found |
| 410 | Job already finished (MJPEG endpoint) |
| 429 | Rate limited |
| 500 | Internal server error |

---

## Implementation Notes

- **MJPEG frames** come from Chrome DevTools Protocol `Page.screencastFrame`, converted PNG→JPEG via Pillow.
- **Agent events** are extracted by polling `agent.state.n_steps` every 500ms and reading the agent history. This is non-blocking and does not interfere with browser_use internals.
- **Fan-out** is implemented via per-client `asyncio.Queue` objects attached to each `Job`.
- **CORS** is fully open for development; tighten before production.
