import { motion } from "framer-motion";
import type { Macros } from "../types/nutrition";
import { cn } from "../lib/cn";

interface MacroStripProps {
  macros: Macros;
}

export function MacroStrip({ macros }: MacroStripProps) {
  const p = macros.protein;
  const f = macros.fat;
  const c = macros.carbs;
  const total = p + f + c || 1;
  const pct = (x: number) => Math.round((x / total) * 100);

  const bars = [
    {
      label: "Protein",
      value: p,
      pct: pct(p),
      tone: "bg-sage",
      track: "bg-sage/15",
    },
    {
      label: "Fat",
      value: f,
      pct: pct(f),
      tone: "bg-sage-muted",
      track: "bg-sage-muted/20",
    },
    {
      label: "Carbs",
      value: c,
      pct: pct(c),
      tone: "bg-accent-orange/90",
      track: "bg-accent-orange/15",
    },
  ];

  return (
    <div className="rounded-[20px] border border-black/[0.05] bg-white p-4 shadow-[0_14px_44px_-28px_rgba(45,79,30,0.15)] sm:rounded-[22px] sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6 lg:items-start">
        <div>
          <p className="font-display text-lg text-sage sm:text-xl">
            Macronutrients
          </p>
          <p className="font-sans mt-0.5 text-xs text-black/45 sm:text-sm">
            Distribution by mass – protein, fat, carbohydrates
          </p>
        </div>
        <div className="font-sans hidden gap-6 text-right text-[10px] font-medium uppercase tracking-[0.2em] text-black/35 lg:flex lg:text-xs">
          <span>P</span>
          <span>F</span>
          <span>C</span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:mt-6 sm:grid-cols-3 sm:gap-6">
        {bars.map((row, i) => (
          <div key={row.label} className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-sans text-xs font-medium text-black/70 sm:text-sm">
                {row.label}
              </span>
              <span className="font-display text-lg text-sage tabular-nums sm:text-xl">
                {row.value.toFixed(1)}
                <span className="font-sans text-[10px] font-normal text-black/40 sm:text-xs">
                  {" "}
                  g
                </span>
              </span>
            </div>
            <div
              className={cn(
                "h-2 overflow-hidden rounded-full sm:h-2.5",
                row.track,
              )}
            >
              <motion.div
                className={cn("h-full rounded-full", row.tone)}
                initial={{ width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{
                  duration: 0.9,
                  delay: 0.12 + i * 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
            <p className="font-sans text-[10px] text-black/40 sm:text-xs">
              ~{row.pct}% of macro mass
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
