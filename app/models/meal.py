"""Structured meal analysis payload returned by Gemini."""

from __future__ import annotations

from typing import Self

from pydantic import BaseModel, Field, model_validator


class Macros(BaseModel):
    """Macronutrients for the whole meal with fiber and alcohol for Atwater checks."""

    protein: float = Field(description="Total protein in grams")
    fat: float = Field(description="Total fat in grams")
    carbs: float = Field(
        description=(
            "Total carbohydrate grams as typically labeled (includes dietary fiber)."
        ),
    )
    fiber: float = Field(
        default=0.0,
        description="Dietary fiber in grams (0 if negligible or not applicable).",
    )
    alcohol: float = Field(
        default=0.0,
        description="Ethanol from alcoholic beverages in grams (0 if none).",
    )

    @model_validator(mode="after")
    def fiber_lte_total_carbs(self) -> Self:
        """Ensure fiber does not exceed declared carbs (invalid USDA-style inputs).

        Why: Digestible carbs use ``carbs - fiber``; fiber above carbs breaks semantics.
        """
        if self.fiber > self.carbs + 1e-6:
            raise ValueError("fiber cannot exceed total carbohydrates")
        return self


class MealItem(BaseModel):
    """Single ingredient line with estimated energy."""

    name: str
    calories: int
    amount: str


class MealAnalysis(BaseModel):
    """Full structured meal analysis from the primary or corrective model."""

    items: list[MealItem]
    total_calories: int
    meal_score: int = Field(
        ge=1,
        le=10,
        description="Overall meal quality score from 1 to 10",
    )
    macros: Macros
    glycemic_index: str = Field(description="Rating: Low, Medium, or High")
    is_balanced: bool = Field(
        description="Whether the meal has a favorable P/F/C distribution.",
    )
    summary: str
