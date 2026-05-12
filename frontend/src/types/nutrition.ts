export interface MealItem {
  name: string
  amount: string
  calories: number
}

export interface Macros {
  protein: number
  fat: number
  carbs: number
}

export interface AnalyzeResponse {
  items: MealItem[]
  total_calories: number
  meal_score: number
  macros: Macros
  glycemic_index: string
  is_balanced: boolean
  summary: string
}
