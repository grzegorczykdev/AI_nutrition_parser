import { useEffect, useId, useState } from "react";
import { animate } from "framer-motion";

interface HealthScoreGaugeProps {
  score: number;
  /** Dashboard card size — thinner track ring + thicker progress arc */
  compact?: boolean;
}

const scoreGradient = (s: number): [string, string] => {
  if (s >= 8) return ["#2d4f1e", "#5a9e4a"];
  if (s >= 6) return ["#3d6628", "#7cb569"];
  if (s >= 4) return ["#fb923c", "#c2410c"];
  return ["#f97316", "#9a3412"];
};

const getScoreLabel = (score: number) => {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Balanced";
  if (score >= 4) return "Room to improve";
  return "Needs attention";
};

export function HealthScoreGauge({
  score,
  compact = false,
}: HealthScoreGaugeProps) {
  const clamped = Math.max(1, Math.min(10, Math.round(score)));
  const uid = useId();
  const gradId = `gauge-grad-${uid}`;

  const ringR = compact ? 56 : 78;
  const trackStroke = compact ? 5 : 8;
  const progressStroke = compact ? 12 : 12;
  const normalizedRadius = ringR;
  const circumference = normalizedRadius * 2 * Math.PI;

  const [displayScore, setDisplayScore] = useState(0);
  const [strokeOffset, setStrokeOffset] = useState(circumference);

  useEffect(() => {
    const controls = animate(0, clamped, {
      duration: 1.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        const rounded = Math.round(v);
        setDisplayScore(rounded);
        const p = rounded / 10;
        setStrokeOffset(circumference - p * circumference);
      },
    });
    return () => controls.stop();
  }, [clamped, circumference]);

  const [c0, c1] = scoreGradient(clamped);

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={
          compact
            ? "relative mx-auto h-[min(220px,72vw)] w-[min(220px,72vw)] max-w-[220px] sm:h-[min(248px,50vw)] sm:w-[min(248px,50vw)] sm:max-w-[248px]"
            : "relative h-[min(320px,85vw)] w-[min(320px,85vw)] max-w-[320px]"
        }
      >
        <svg
          className="h-full w-full -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={c0} />
              <stop offset="100%" stopColor={c1} />
            </linearGradient>
          </defs>

          {/* Thin full ring (track) */}
          <circle
            cx="100"
            cy="100"
            r={normalizedRadius}
            fill="transparent"
            stroke="rgba(0,0,0,0.09)"
            strokeWidth={trackStroke}
          />
          {/* Thick progress arc */}
          <circle
            cx="100"
            cy="100"
            r={normalizedRadius}
            fill="transparent"
            stroke={`url(#${gradId})`}
            strokeWidth={progressStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className={compact ? "drop-shadow-[0_4px_20px_rgba(234,88,12,0.25)]" : ""}
            style={{
              transition: "stroke-dashoffset 0.15s ease-out",
            }}
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={
              compact
                ? "font-display text-[clamp(2.35rem,11vw,3.25rem)] leading-none tracking-tight text-sage"
                : "font-display text-[clamp(3.5rem,14vw,5rem)] leading-none tracking-tight text-sage"
            }
            style={{ fontWeight: 400 }}
          >
            {displayScore}
            <span className="font-sans text-[0.42em] font-medium text-black/35">
              /10
            </span>
          </span>
          <p
            className={
              compact
                ? "font-display mt-2 max-w-[11rem] text-center text-sm leading-snug text-sage sm:mt-3"
                : "font-sans mt-3 max-w-[12rem] text-center text-sm font-medium leading-snug text-sage-muted"
            }
          >
            {getScoreLabel(clamped)}
          </p>
        </div>
      </div>
    </div>
  );
}
