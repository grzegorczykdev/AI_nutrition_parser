interface HealthScoreGaugeProps {
  score: number;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-emerald-600";
  if (score >= 6) return "text-lime-600";
  if (score >= 4) return "text-amber-500";
  return "text-rose-500";
};

const getScoreLabel = (score: number) => {
  if (score >= 8) return "Excellent";
  if (score >= 6) return "Balanced";
  if (score >= 4) return "Needs Improvement";
  return "Low";
};

export function HealthScoreGauge({ score }: HealthScoreGaugeProps) {
  const clamped = Math.max(1, Math.min(10, Math.round(score)));
  const radius = 72;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (clamped / 10) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-44">
        <svg
          className="h-full w-full -rotate-90 transform"
          viewBox="0 0 144 144"
        >
          <circle
            cx="72"
            cy="72"
            r={normalizedRadius}
            className="text-slate-200"
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="72"
            cy="72"
            r={normalizedRadius}
            className={getScoreColor(clamped)}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{
              strokeDasharray: circumference,
              strokeDashoffset,
              transition: "stroke-dashoffset 700ms ease-out",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-semibold ${getScoreColor(clamped)}`}>
            {clamped}
          </span>
          <span className="mt-1 text-sm text-slate-500">/10</span>
        </div>
      </div>
      <p className={`mt-3 text-sm font-medium ${getScoreColor(clamped)}`}>
        {getScoreLabel(clamped)}
      </p>
    </div>
  );
}
