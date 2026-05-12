"""Deterministic validation results shipped alongside meal analysis."""

from pydantic import BaseModel, Field


class MacroValidationResult(BaseModel):
    """Outcome of comparing reported calories to macros and ingredient rows.

    Used both for client transparency and as context for the corrective judge.
    """

    calories_from_macros: float = Field(
        description="kcal implied by macros (fiber/alcohol-aware Atwater).",
    )
    sum_item_calories: int = Field(
        description="Sum of per-ingredient calorie fields.",
    )
    total_calories_reported: int
    macro_vs_total_delta_pct: float = Field(
        description="Relative gap between total_calories and calories_from_macros.",
    )
    items_vs_total_delta_pct: float = Field(
        description="Relative gap between total_calories and sum of item calories.",
    )
    macros_consistent_with_total: bool
    items_consistent_with_total: bool
    overall_math_ok: bool
    notes: str
