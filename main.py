"""Entrypoint for ``uv run main.py`` / ``uvicorn main:app``."""

from __future__ import annotations

import logging

from app.main import create_app

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)

app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
