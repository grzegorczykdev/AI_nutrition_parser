import { Flame } from "lucide-react";
import type { MealItem } from "../types/nutrition";

interface IngredientCardsProps {
  items: MealItem[];
}

const avatarHue = (name: string) => {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h + name.charCodeAt(i) * (i + 1)) % 360;
  return h;
};

export function IngredientCards({ items }: IngredientCardsProps) {
  if (!items.length) {
    return (
      <p className="font-sans rounded-[18px] border border-dashed border-black/10 bg-white/80 px-4 py-6 text-center text-xs text-black/45 sm:rounded-[22px] sm:px-5 sm:py-8 sm:text-sm">
        No ingredients detected - try a richer description or add a photo.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {items.map((item, index) => {
        const letter = item.name.trim().charAt(0).toUpperCase() || "?";
        const hue = avatarHue(item.name);
        return (
          <div
            key={`${item.name}-${index}`}
            className="group flex max-w-full items-center gap-2 rounded-full border border-black/[0.06] bg-white py-1.5 pl-1.5 pr-3 shadow-[0_6px_22px_-14px_rgba(45,79,30,0.18)] transition hover:shadow-[0_10px_28px_-14px_rgba(45,79,30,0.2)] sm:gap-3 sm:py-2 sm:pl-2 sm:pr-4"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold text-white shadow-inner ring-2 ring-white sm:h-9 sm:w-9 sm:text-xs"
              style={{
                background: `linear-gradient(135deg, hsl(${hue}, 42%, 38%) 0%, hsl(${(hue + 40) % 360}, 38%, 52%) 100%)`,
              }}
              aria-hidden
            >
              {letter}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-sans text-xs font-semibold capitalize text-black/85 sm:text-sm">
                {item.name}
              </p>
              <p className="font-sans truncate text-[10px] text-black/45 sm:text-xs">
                {item.amount}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 rounded-full bg-accent-orange/10 px-2 py-0.5 font-sans text-[10px] font-semibold text-accent-orange sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
              <Flame className="size-3 opacity-90 sm:size-3.5" aria-hidden />
              {item.calories}
            </div>
          </div>
        );
      })}
    </div>
  );
}
