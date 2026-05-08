import { Flame, UtensilsCrossed } from "lucide-react"
import type { MealItem } from "../types/nutrition"

interface IngredientCardsProps {
  items: MealItem[]
}

export function IngredientCards({ items }: IngredientCardsProps) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
        No ingredients were detected in the meal description.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <article
          key={`${item.name}-${index}`}
          className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <UtensilsCrossed size={16} className="text-emerald-700" />
                <span className="truncate capitalize">{item.name}</span>
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {item.amount}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              <Flame size={14} />
              {item.calories} kcal
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
