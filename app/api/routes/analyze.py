"""Meal analysis HTTP routes."""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from google.genai import errors as genai_errors
from pydantic import ValidationError

from app.exceptions import NutritionAnalysisError
from app.schemas.responses import VerifiedAnalyzeResponse
from app.services.gemini_nutrition import analyze_and_verify_meal

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/analyze",
    response_model=VerifiedAnalyzeResponse,
    summary="Analyze a meal (text and/or image)",
)
async def analyze_meal(
    meal_description: str = Form(default=""),
    file: UploadFile | None = File(default=None),
) -> VerifiedAnalyzeResponse:
    """Accept multipart form data and return verified structured nutrition analysis.

    Why multipart: browsers send photos as ``multipart/form-data``; FastAPI maps fields
    and optional binary efficiently without base64 overhead.

    Args:
        meal_description: Free-text meal description (optional if image provided).
        file: Optional image upload (JPEG/PNG/WebP/HEIC depending on client).

    Returns:
        VerifiedAnalyzeResponse: Final meal analysis with deterministic macro checks
            and optional audit metadata.

    Raises:
        HTTPException: 422 for invalid input, 502/503 for upstream AI failures.
    """
    normalized_description = meal_description.strip()
    image_bytes: bytes | None = None
    image_mime_type: str | None = None

    if file is not None:
        image_bytes = await file.read()
        image_mime_type = file.content_type or "image/jpeg"

    if not normalized_description and not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one input: meal_description or file.",
        )

    try:
        return await analyze_and_verify_meal(
            description=normalized_description,
            image_bytes=image_bytes,
            image_mime_type=image_mime_type,
        )
    except NutritionAnalysisError as exc:
        logger.warning("Nutrition analysis failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc) or "Nutrition model returned an invalid response.",
        ) from exc
    except genai_errors.ClientError as exc:
        logger.warning("Gemini client error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The AI request could not be completed. Check inputs and API key.",
        ) from exc
    except (genai_errors.ServerError, genai_errors.APIError) as exc:
        logger.warning("Gemini upstream error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="The AI service is temporarily unavailable. Retry shortly.",
        ) from exc
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=exc.errors(),
        ) from exc
