"""Entrypoint: uvicorn server for the Ghost Shopper backend."""

import uvicorn
from backend.config import API_HOST, API_PORT
from backend.server import app  # noqa: F401 — imported to ensure routes are registered

if __name__ == "__main__":
    uvicorn.run("backend.server:app", host=API_HOST, port=API_PORT, reload=False)
