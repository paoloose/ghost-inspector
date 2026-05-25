# Ghost Shopper — Agent Context

## Architecture

Full-stack Ghost Shopper platform for real estate mystery shopping with AI bots.

- **Frontend**: React 18 + Vite + Tailwind CSS (dark mode)
- **Backend**: Starlette + uvicorn, wrapping `browser_use.Agent`
- **Agent**: CDP screencast MJPEG streaming + WebSocket events
- **Database**: SQLite via `asyncio.to_thread()`

## Key Design Decisions

- **Model hardcoded**: `kimi-k2.6` — clients cannot override
- **Headless always on**: no UI toggle
- **Task types**: Backend owns prompt templates (`whatsapp`, `forms`, `call`, `everything`)
- **Rate limit**: 20s global cooldown between jobs
- **CORS**: fully open for development (`*`)

## File Map

| File | Purpose |
|------|---------|
| `backend/server.py` | Starlette app, routes, lifespan |
| `backend/agent_runner.py` | Agent wrapper with CDP screencast + step polling |
| `backend/jobs.py` | Job dataclass + JobManager with fan-out queues |
| `backend/config.py` | Config, `TASK_TEMPLATES`, hardcoded model |
| `backend/models.py` | Pydantic request/response models |
| `backend/db.py` | SQLite schema initialization |
| `backend/mjpeg.py` | MJPEG multipart stream endpoint |
| `backend/events.py` | WebSocket events endpoint |
| `admin-dashboard/src/Radar.jsx` | Business list + detail with sub-tabs |
| `admin-dashboard/src/Audits.jsx` | 3-step wizard (select → configure → run) |
| `admin-dashboard/src/Contacts.jsx` | Email threads with sparklines, score meters |
| `admin-dashboard/src/data.js` | Mock data: 4 businesses, 3 contacts, 3 audits |
| `demos/ramirezvazquez.com/` | Replica of ramirezvazquez.com for testing |
| `PROTOCOL.md` | Full API specification |

## Running

```bash
# Backend
python main.py
# or: uvicorn main:app --host 0.0.0.0 --port 8001

# Frontend
cd admin-dashboard && npm run dev
```

## API Key

`sk-yvZu1ysvDgn59ykTxl78AloGneqJCFJJQlCwyuJSumHMThDiFkT2WeNXtC4ydoDa`

## Environment

- Backend: `localhost:8001`
- Frontend dev server: `localhost:5173`
