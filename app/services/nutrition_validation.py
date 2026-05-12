"""Deterministic calories checks (Atwater + ingredient sums).

Separated from HTTP and LLM layers so the same math runs in tests without I/O.
"""

from __future__ import annotations

from app.models import MealAnalysis
from app.schemas.validation import MacroValidationResult


def digestible_carbs_g(carbs: float, fiber: float) -> float:
    """Return non-fiber carbohydrate mass for energy calculation."""
    return max(carbs - fiber, 0.0)


def expected_calories_atwater(meal: MealAnalysis) -> float:
    """Compute kcal from macros using modified Atwater factors.

    Uses protein and digestible carbs at 4 kcal/g, fiber at 2 kcal/g,
    fat at 9 kcal/g, ethanol at 7 kcal/g.

    Args:
        meal: Parsed meal analysis including fiber and alcohol fields.

    Returns:
        Expected kilocalories implied by macro gram totals.
    """
    m = meal.macros
    dc = digestible_carbs_g(m.carbs, m.fiber)
    return (
        m.protein * 4.0
        + dc * 4.0
        + m.fiber * 2.0
        + m.fat * 9.0
        + m.alcohol * 7.0
    )


def validate_macro_math(
    analysis: MealAnalysis,
    *,
    macro_rel_tol: float = 0.12,
    items_rel_tol: float = 0.15,
    small_meal_abs_tol_kcal: float = 35.0,
) -> MacroValidationResult:
    """Check ``total_calories`` vs macro-derived kcal and vs sum of line-item calories.

    Args:
        analysis: Meal analysis (typically model output).
        macro_rel_tol: Maximum relative deviation for macro-vs-total check.
        items_rel_tol: Maximum relative deviation for items-sum-vs-total check.
        small_meal_abs_tol_kcal: Absolute slack for very small meals (avoids noise).

    Returns:
        MacroValidationResult: Percent gaps and pass/fail flags with human-readable notes.
    """
    m = analysis.macros
    reported = float(analysis.total_calories)

    from_macros = expected_calories_atwater(analysis)

    if reported <= 0:
        notes = "Reported total calories are zero or negative; cannot validate."
        return MacroValidationResult(
            calories_from_macros=from_macros,
            sum_item_calories=sum(i.calories for i in analysis.items),
            total_calories_reported=analysis.total_calories,
            macro_vs_total_delta_pct=1.0,
            items_vs_total_delta_pct=1.0,
            macros_consistent_with_total=False,
            items_consistent_with_total=False,
            overall_math_ok=False,
            notes=notes,
        )

    item_sum = sum(i.calories for i in analysis.items)
    macro_vs_total_delta_pct = abs(from_macros - reported) / max(reported, 1.0)
    items_vs_total_delta_pct = abs(float(item_sum) - reported) / max(reported, 1.0)

    def passes(rel_delta: float, rel_tol: float, abs_gap_kcal: float) -> bool:
        return rel_delta <= rel_tol or abs_gap_kcal <= small_meal_abs_tol_kcal

    macros_ok = passes(
        macro_vs_total_delta_pct,
        macro_rel_tol,
        abs(from_macros - reported),
    ) and (
        m.protein >= 0
        and m.fat >= 0
        and m.carbs >= 0
        and m.fiber >= 0
        and m.alcohol >= 0
        and m.fiber <= m.carbs + 1e-6
    )
    items_ok = passes(
        items_vs_total_delta_pct,
        items_rel_tol,
        abs(float(item_sum) - reported),
    )

    parts: list[str] = []
    if not macros_ok:
        parts.append(
            f"Nutrients imply ~{from_macros:.0f} kcal vs reported {reported:.0f} kcal "
            f"({macro_vs_total_delta_pct * 100:.1f}% off).",
        )
    if not items_ok:
        parts.append(
            f"Ingredient calories sum to {item_sum} kcal vs total "
            f"{analysis.total_calories} kcal ({items_vs_total_delta_pct * 100:.1f}% off).",
        )
    if macros_ok and items_ok:
        parts.append(
            "Nutrient-derived kcal (fiber/alcohol-aware) and ingredient sums align "
            "within tolerance.",
        )

    return MacroValidationResult(
        calories_from_macros=from_macros,
        sum_item_calories=item_sum,
        total_calories_reported=analysis.total_calories,
        macro_vs_total_delta_pct=macro_vs_total_delta_pct,
        items_vs_total_delta_pct=items_vs_total_delta_pct,
        macros_consistent_with_total=macros_ok,
        items_consistent_with_total=items_ok,
        overall_math_ok=macros_ok and items_ok,
        notes=" ".join(parts),
    )


def validate_nutritional_consistency(
    data: MealAnalysis,
    *,
    margin: float,
) -> bool:
    """Return True if ``total_calories`` matches Atwater-derived kcal within ``margin``.

    This gate avoids unnecessary corrective judge calls (cost + latency).

    Args:
        data: Parsed meal analysis.
        margin: Maximum relative difference (e.g. 0.10 for 10%).

    Returns:
        bool: Whether the meal passes the consistency gate.
    """
    reported = float(data.total_calories)
    if reported <= 0:
        return False
    expected = expected_calories_atwater(data)
    return abs(expected - reported) / reported <= margin
