"""Judge / audit structures layered on top of meal analysis."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.models.meal import MealAnalysis


class MealAuditOutput(BaseModel):
    """Structured JSON from the corrective judge (includes final meal analysis)."""

    verdict: Literal["approved", "adjusted"] = Field(
        description=(
            "approved if output matches draft without numeric fixes; "
            "adjusted after corrections."
        ),
    )
    findings: list[str] = Field(
        default_factory=list,
        description="Concrete audit bullets (math, portions, clinical consistency).",
    )
    judge_notes: str = Field(description="Short rationale for the verdict.")
    final_analysis: MealAnalysis = Field(
        description="Echo or corrected MealAnalysis after audit.",
    )


class MealAuditSummary(BaseModel):
    """API-facing audit metadata exposed to clients."""

    verdict: Literal["approved", "adjusted", "skipped"]
    findings: list[str]
    judge_notes: str
