"""FastAPI application factory."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.analyze import router as analyze_router
from app.config import get_settings
from app.exceptions import ConfigurationError

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Build and configure the ASGI application.

    Pulls CORS allow-list from settings so deployments can widen origins via env
    without code edits.

    Returns:
        FastAPI: Configured application instance.
    """
    try:
        settings = get_settings()
    except ConfigurationError as exc:
        logger.exception("Missing or invalid API configuration")
        raise RuntimeError("Application configuration is invalid.") from exc

    app = FastAPI(
        title="AI Nutrition Parser",
        version="0.1.0",
        description=(
            "Structured meal analysis using Gemini with deterministic macro validation "
            "and optional corrective audit."
        ),
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_allow_origins),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(analyze_router)

    return app
