"""HTTP response envelopes."""

from pydantic import BaseModel, Field

from app.models import MealAnalysis, MealAuditSummary
from app.schemas.validation import MacroValidationResult


class VerifiedAnalyzeResponse(BaseModel):
    """Successful ``POST /analyze`` payload.

    Why separate schema: keeps FastAPI ``response_model`` stable while domain models
    evolve (e.g. optional audit fields later).
    """

    meal_analysis: MealAnalysis = Field(
        description="Final meal analysis after optional corrective pass.",
    )
    macro_validation: MacroValidationResult
    audit: MealAuditSummary
