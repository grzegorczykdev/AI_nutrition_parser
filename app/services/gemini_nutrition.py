"""Gemini client calls and orchestration (primary analysis + triggered judge)."""

from __future__ import annotations

import asyncio
import logging

from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from tenacity import retry, retry_if_exception, stop_after_attempt, wait_exponential

from app.config import get_settings
from app.exceptions import NutritionAnalysisError
from app.models import MealAnalysis, MealAuditOutput, MealAuditSummary
from app.schemas.responses import VerifiedAnalyzeResponse
from app.schemas.validation import MacroValidationResult
from app.services import prompts
from app.services.nutrition_validation import (
    validate_macro_math,
    validate_nutritional_consistency,
)

logger = logging.getLogger(__name__)

_RETRYABLE_GENAI = (
    genai_errors.ClientError,
    genai_errors.ServerError,
    genai_errors.APIError,
)

_genai_client: genai.Client | None = None


def _client() -> genai.Client:
    """Lazy Gemini SDK client (one per worker process)."""
    global _genai_client
    if _genai_client is None:
        _genai_client = genai.Client(api_key=get_settings().gemini_api_key)
    return _genai_client


def _generate_analysis_sync(
    description: str,
    image_bytes: bytes | None,
    image_mime_type: str | None,
    *,
    model_id: str,
) -> MealAnalysis:
    """Blocking Gemini structured call for primary meal analysis."""
    user_context = (
        f"Meal description: {description}"
        if description
        else "No text description provided. Infer meal details from the image."
    )

    contents: list[str | types.Part] = [prompts.PRIMARY_DIETITIAN_PROMPT, user_context]
    if image_bytes:
        contents.append(
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type or "image/jpeg",
            ),
        )

    response = _client().models.generate_content(
        model=model_id,
        contents=contents,
        config={
            "response_mime_type": "application/json",
            "response_schema": MealAnalysis,
        },
    )

    parsed = response.parsed
    if parsed is None:
        logger.error("Gemini returned empty parsed payload for meal analysis.")
        raise NutritionAnalysisError()
    return parsed


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception(lambda e: isinstance(e, _RETRYABLE_GENAI)),
    reraise=True,
)
async def analyze_meal_with_ai(
    description: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
) -> MealAnalysis:
    """Run primary structured meal analysis (Flash-class model by default).

    Args:
        description: Free-text meal description (may be empty if image-only).
        image_bytes: Optional raw image bytes.
        image_mime_type: MIME type for ``image_bytes``.

    Returns:
        MealAnalysis: Validated structured analysis.

    Raises:
        NutritionAnalysisError: On persistent upstream or parse failures.
    """
    settings = get_settings()
    return await asyncio.to_thread(
        _generate_analysis_sync,
        description,
        image_bytes,
        image_mime_type,
        model_id=settings.gemini_analysis_model,
    )


def _corrective_judge_sync(
    description: str,
    image_bytes: bytes | None,
    image_mime_type: str | None,
    draft: MealAnalysis,
    macro_validation: MacroValidationResult,
    *,
    model_id: str,
) -> MealAuditOutput:
    """Blocking corrective judge call."""
    draft_json = draft.model_dump_json()
    validation_json = macro_validation.model_dump_json()

    user_blob = (
        f"Meal description (authoritative where stated):\n{description or '[none]'}\n\n"
        f"Python validation snapshot:\n{validation_json}\n\n"
        f"Inconsistent draft MealAnalysis JSON:\n{draft_json}"
    )

    contents: list[str | types.Part] = [prompts.CORRECTIVE_JUDGE_PROMPT, user_blob]
    if image_bytes:
        contents.append(
            types.Part.from_bytes(
                data=image_bytes,
                mime_type=image_mime_type or "image/jpeg",
            ),
        )

    response = _client().models.generate_content(
        model=model_id,
        contents=contents,
        config={
            "response_mime_type": "application/json",
            "response_schema": MealAuditOutput,
        },
    )

    parsed = response.parsed
    if parsed is None:
        logger.error("Gemini returned empty parsed payload for corrective judge.")
        raise NutritionAnalysisError()
    return parsed


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception(lambda e: isinstance(e, _RETRYABLE_GENAI)),
    reraise=True,
)
async def run_corrective_judge(
    description: str,
    draft: MealAnalysis,
    macro_validation: MacroValidationResult,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
) -> MealAuditOutput:
    """Invoke second-pass model when deterministic consistency fails."""
    settings = get_settings()
    return await asyncio.to_thread(
        _corrective_judge_sync,
        description,
        image_bytes,
        image_mime_type,
        draft,
        macro_validation,
        model_id=settings.gemini_judge_model,
    )


async def analyze_and_verify_meal(
    description: str,
    image_bytes: bytes | None = None,
    image_mime_type: str | None = None,
) -> VerifiedAnalyzeResponse:
    """Primary analysis, deterministic validation, optional corrective judge.

    Why: Skipping the judge when math already aligns saves latency and API cost
    while preserving a stronger model path for inconsistent drafts.

    Args:
        description: User meal description.
        image_bytes: Optional photo bytes.
        image_mime_type: MIME type when ``image_bytes`` is set.

    Returns:
        VerifiedAnalyzeResponse: Final meal JSON, macro validation snapshot, audit summary.
    """
    settings = get_settings()
    draft = await analyze_meal_with_ai(
        description=description,
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
    )

    if validate_nutritional_consistency(
        draft,
        margin=settings.nutritional_consistency_margin,
    ):
        macro_validation = validate_macro_math(draft)
        summary = MealAuditSummary(
            verdict="skipped",
            findings=[],
            judge_notes=(
                f"Nutritional consistency within "
                f"{settings.nutritional_consistency_margin:.0%} margin; "
                "corrective judge not invoked."
            ),
        )
        return VerifiedAnalyzeResponse(
            meal_analysis=draft,
            macro_validation=macro_validation,
            audit=summary,
        )

    macro_validation_pre = validate_macro_math(draft)
    audit_out = await run_corrective_judge(
        description=description,
        draft=draft,
        macro_validation=macro_validation_pre,
        image_bytes=image_bytes,
        image_mime_type=image_mime_type,
    )
    final_meal = audit_out.final_analysis
    macro_validation = validate_macro_math(final_meal)

    summary = MealAuditSummary(
        verdict=audit_out.verdict,
        findings=audit_out.findings,
        judge_notes=audit_out.judge_notes,
    )

    return VerifiedAnalyzeResponse(
        meal_analysis=final_meal,
        macro_validation=macro_validation,
        audit=summary,
    )
