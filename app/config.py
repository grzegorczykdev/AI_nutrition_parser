"""Environment-backed configuration (no secrets committed)."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache

from dotenv import load_dotenv

from app.exceptions import ConfigurationError


@dataclass(frozen=True, slots=True)
class Settings:
    """Runtime settings loaded once per process.

    Why frozen/slots: immutable config avoids accidental mutation in request handlers;
    aligns with twelve-factor style env configuration.

    Attributes:
        gemini_api_key: Google AI Studio / Gemini API key.
        gemini_analysis_model: Primary structured-output model for meal analysis.
        gemini_judge_model: Corrective judge model when consistency checks fail.
        nutritional_consistency_margin: Max relative gap allowed between Atwater-derived
            kcal and ``total_calories`` before invoking the judge (e.g. 0.10 = 10%).
        cors_allow_origins: Browser origins allowed by CORS (comma-separated in env).
    """

    gemini_api_key: str
    gemini_analysis_model: str
    gemini_judge_model: str
    nutritional_consistency_margin: float
    cors_allow_origins: tuple[str, ...]


def _split_origins(raw: str | None) -> tuple[str, ...]:
    if not raw:
        return ("http://localhost:5173",)
    return tuple(o.strip() for o in raw.split(",") if o.strip())


@lru_cache
def get_settings() -> Settings:
    """Load and cache settings from the environment.

    Loads ``.env`` on first access so imports work regardless of entrypoint order.

    Returns:
        Settings: Validated immutable configuration.

    Raises:
        ConfigurationError: If ``YOUR_GEMINI_API_KEY`` is missing or empty.
        ValueError: If ``NUTRITIONAL_CONSISTENCY_MARGIN`` is not a valid float.
    """
    load_dotenv()
    key = os.getenv("YOUR_GEMINI_API_KEY", "").strip()
    if not key:
        raise ConfigurationError(
            "YOUR_GEMINI_API_KEY is not set or empty in the environment.",
        )

    margin_raw = os.getenv("NUTRITIONAL_CONSISTENCY_MARGIN", "0.10")
    try:
        margin = float(margin_raw)
    except ValueError as exc:
        raise ValueError(
            "NUTRITIONAL_CONSISTENCY_MARGIN must be a float (e.g. 0.10).",
        ) from exc

    return Settings(
        gemini_api_key=key,
        gemini_analysis_model=os.getenv(
            "GEMINI_ANALYSIS_MODEL",
            "gemini-3.1-flash-lite",
        ),
        gemini_judge_model=os.getenv(
            "GEMINI_JUDGE_MODEL",
            "gemini-3.1-pro-preview",
        ),
        nutritional_consistency_margin=margin,
        cors_allow_origins=_split_origins(os.getenv("CORS_ALLOW_ORIGINS")),
    )
