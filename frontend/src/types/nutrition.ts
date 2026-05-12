export interface MealItem {
  name: string
  amount: string
  calories: number
}

export interface Macros {
  protein: number
  fat: number
  carbs: number
  /** Dietary fiber (g); API defaults to 0 */
  fiber?: number
  /** Ethanol from alcoholic drinks (g); API defaults to 0 */
  alcohol?: number
}

/** Legacy flat shape; primary payload is now nested under meal_analysis. */
export interface AnalyzeResponse {
  items: MealItem[]
  total_calories: number
  meal_score: number
  macros: Macros
  glycemic_index: string
  is_balanced: boolean
  summary: string
}

export interface MacroValidationResult {
  calories_from_macros: number
  sum_item_calories: number
  total_calories_reported: number
  macro_vs_total_delta_pct: number
  items_vs_total_delta_pct: number
  macros_consistent_with_total: boolean
  items_consistent_with_total: boolean
  overall_math_ok: boolean
  notes: string
}

export interface MealAuditSummary {
  verdict: "approved" | "adjusted" | "skipped"
  findings: string[]
  judge_notes: string
}

export interface VerifiedAnalyzeResponse {
  meal_analysis: AnalyzeResponse
  macro_validation: MacroValidationResult
  audit: MealAuditSummary
}
