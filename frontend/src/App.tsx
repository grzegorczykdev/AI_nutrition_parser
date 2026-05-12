import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import imageCompression from "browser-image-compression";
import {
  Sparkles,
  Salad,
  Camera,
  X,
  Flame,
  Gauge,
  Scale,
  Leaf,
} from "lucide-react";
import { analyzeMeal, ApiError } from "./api/analyzeMeal";
import { ErrorAlert } from "./components/ErrorAlert";
import { HealthScoreGauge } from "./components/HealthScoreGauge";
import { IngredientCards } from "./components/IngredientCards";
import { LoadingPulse } from "./components/LoadingPulse";
import { MacroStrip } from "./components/MacroStrip";
import { DietitianNoteCard } from "./components/DietitianNoteCard";
import type { VerifiedAnalyzeResponse } from "./types/nutrition";
import { cn } from "./lib/cn";

const MARQUEE_TIPS = [
  "Add a hand or fork in frame for scale",
  "Mention cooking oil if relevant",
  "Note alcohol for accurate kcal",
  "Mention hidden sugar, honey, or cream",
  "Bright lighting improves food recognition",
  "Further details – a more detailed analysis",
];

const bentoContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const bentoItem = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

function App() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mealDescription, setMealDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState<VerifiedAnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const trimmedDescription = mealDescription.trim();

  const canSubmit = useMemo(
    () =>
      !isLoading && (trimmedDescription.length > 0 || selectedFile !== null),
    [isLoading, trimmedDescription, selectedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const pickImageFile = (file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    pickImageFile(file);
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyzeMeal = async () => {
    if (!trimmedDescription && !selectedFile) {
      setErrorMessage(
        "Add a meal description or upload an image before analyzing.",
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      let fileForUpload: File | null = selectedFile;

      if (selectedFile) {
        try {
          fileForUpload = await imageCompression(selectedFile, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            fileType: "image/webp",
            useWebWorker: true,
          });
        } catch {
          fileForUpload = await imageCompression(selectedFile, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1024,
            fileType: "image/jpeg",
            useWebWorker: true,
          });
        }
      }

      const data = await analyzeMeal(trimmedDescription, fileForUpload);
      setResult(data);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unexpected network error. Please try again.");
      }
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const duplicatedTips = [...MARQUEE_TIPS, ...MARQUEE_TIPS];

  return (
    <main className="font-sans text-black/85 min-h-screen w-full px-4 pb-14 pt-5 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-md sm:max-w-2xl lg:max-w-4xl">
        {/* Input hero */}
        <section className="relative">
          <div className="mb-5 flex flex-col items-start gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 px-4 py-1.5 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-sage shadow-[0_8px_30px_-18px_rgba(45,79,30,0.25)]">
                <Sparkles size={14} className="text-sage" aria-hidden />
                Nourish
              </p>
              <h1 className="font-display mt-4 max-w-xl text-3xl leading-[1.12] tracking-tight text-sage sm:mt-5 sm:text-4xl">
                Curate your plate.
              </h1>
              <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-black/50 sm:mt-4 sm:text-base">
                Drop a photo or describe your meal to get a detailed analysis of
                your plate.
              </p>
            </div>
          </div>

          <div className="relative mb-4 overflow-hidden rounded-[18px] border border-black/[0.04] bg-white/60 py-2 sm:mb-6 sm:rounded-[22px] sm:py-3">
            <div className="marquee-track flex w-max gap-8 whitespace-nowrap pr-10 font-sans text-[11px] text-black/40 sm:gap-12 sm:pr-12 sm:text-sm">
              {duplicatedTips.map((tip, i) => (
                <span
                  key={`${tip}-${i}`}
                  className="inline-flex items-center gap-1.5 sm:gap-2"
                >
                  <Leaf
                    className="size-3 shrink-0 text-sage/50 sm:size-3.5"
                    aria-hidden
                  />
                  {tip}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:gap-6 lg:grid-cols-12 lg:gap-8">
            <div className="glass-panel flex flex-col rounded-[22px] p-4 shadow-[0_24px_80px_-32px_rgba(45,79,30,0.15)] sm:rounded-[28px] sm:p-6 lg:col-span-7">
              <label
                htmlFor="meal-description"
                className="font-sans text-[10px] font-semibold uppercase tracking-wider text-black/40 sm:text-xs"
              >
                Describe your meal
              </label>
              <textarea
                id="meal-description"
                value={mealDescription}
                onChange={(event) => setMealDescription(event.target.value)}
                placeholder="Grilled salmon, herbed quinoa, roasted broccoli, lemon - lunch at home."
                rows={3}
                className="font-sans mt-2 max-h-[92px] min-h-[76px] w-full flex-1 resize-none rounded-[18px] border border-black/[0.06] bg-white/70 px-3 py-2.5 text-sm leading-snug text-black/85 outline-none ring-0 transition placeholder:text-black/30 focus:border-sage/35 focus:shadow-[0_0_0_3px_rgba(45,79,30,0.12)] sm:mt-4 sm:max-h-none sm:min-h-[140px] sm:rounded-[22px] sm:px-5 sm:py-4 sm:text-base sm:leading-relaxed md:min-h-[160px]"
              />
            </div>

            <div className="lg:col-span-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleUploadClick();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  pickImageFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={cn(
                  "glass-panel relative flex min-h-[148px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[22px] p-4 text-center shadow-[0_24px_80px_-32px_rgba(45,79,30,0.18)] transition sm:min-h-[220px] sm:rounded-[28px] sm:p-8 lg:min-h-[280px]",
                  isDragging &&
                    "border-sage/40 bg-sage/[0.06] ring-2 ring-sage/25",
                )}
                onClick={handleUploadClick}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute right-4 top-4 inline-flex items-center justify-center rounded-full bg-white/95 p-2.5 text-black/70 shadow-lg transition hover:bg-white"
                      aria-label="Remove photo"
                    >
                      <X size={18} />
                    </button>
                    <p className="relative z-[1] mt-auto font-sans text-sm font-medium text-white drop-shadow-md">
                      Tap to replace image
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mb-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage to-sage-muted text-white shadow-[0_12px_28px_-10px_rgba(45,79,30,0.45)] sm:mb-5 sm:h-16 sm:w-16 sm:rounded-3xl">
                      <Camera
                        className="size-[22px] sm:size-7"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </div>
                    <p className="font-display px-1 text-lg leading-tight text-sage sm:text-2xl">
                      Your meal, in frame
                    </p>
                    <p className="font-sans mt-1.5 max-w-[220px] text-[11px] leading-snug text-black/45 sm:mt-2 sm:max-w-[240px] sm:text-sm sm:leading-relaxed">
                      Drag & drop, browse, or capture - we read the scene
                      alongside your words.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-4 sm:mt-10">
            <motion.button
              type="button"
              onClick={handleAnalyzeMeal}
              disabled={!canSubmit}
              whileHover={canSubmit ? { scale: 1.04 } : undefined}
              whileTap={canSubmit ? { scale: 0.97 } : undefined}
              className={cn(
                "font-sans inline-flex items-center gap-2 rounded-[22px] px-7 py-3 text-sm font-semibold shadow-[0_0_48px_-12px_rgba(45,79,30,0.55)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage sm:gap-3 sm:rounded-[28px] sm:px-10 sm:py-4 sm:text-base",
                canSubmit
                  ? "bg-sage text-white hover:shadow-[0_0_56px_-8px_rgba(45,79,30,0.65)]"
                  : "cursor-not-allowed bg-black/10 text-black/35 shadow-none",
              )}
            >
              <Salad
                className="size-[18px] sm:size-[22px]"
                strokeWidth={1.75}
                aria-hidden
              />
              Analyze meal
            </motion.button>

            {errorMessage && (
              <div className="w-full max-w-lg">
                <ErrorAlert message={errorMessage} />
              </div>
            )}
          </div>
        </section>

        {isLoading && (
          <div className="mt-8 sm:mt-10">
            <LoadingPulse />
          </div>
        )}

        {result && !isLoading && (
          <section className="mt-10 sm:mt-12">
            <p className="font-display text-center text-2xl text-sage sm:text-3xl">
              Your meal in detail
            </p>

            <motion.div
              variants={bentoContainer}
              initial="hidden"
              animate="show"
              className="mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-12 lg:items-stretch lg:gap-5"
            >
              {/* lg: meal score (left) stretches to match stacked cards (right) */}
              <motion.article
                variants={bentoItem}
                className="flex min-h-0 flex-col items-center justify-center rounded-[22px] border border-black/[0.05] bg-white p-5 shadow-[0_18px_56px_-36px_rgba(45,79,30,0.2)] sm:rounded-[24px] sm:p-6 lg:col-span-5 lg:h-full lg:self-stretch"
              >
                <p className="font-display text-center text-[10px] uppercase tracking-[0.28em] text-black/35 sm:text-xs sm:tracking-[0.35em]">
                  Meal score
                </p>
                <div className="mt-2 shrink-0 sm:mt-3">
                  <HealthScoreGauge
                    score={result.meal_analysis.meal_score}
                    compact
                  />
                </div>
              </motion.article>

              <motion.div
                variants={bentoItem}
                className="flex min-h-0 flex-col gap-3 sm:gap-4 lg:col-span-7"
              >
                <div className="rounded-[20px] border border-black/[0.05] bg-white p-4 shadow-[0_12px_36px_-28px_rgba(0,0,0,0.06)] sm:rounded-[22px] sm:p-5">
                  <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-black/40 sm:text-xs">
                    Total energy
                  </p>
                  <p className="font-display mt-1 text-3xl tabular-nums text-sage sm:mt-2 sm:text-4xl">
                    {result.meal_analysis.total_calories}
                    <span className="font-sans text-base font-medium text-black/35 sm:text-lg">
                      {" "}
                      kcal
                    </span>
                  </p>
                </div>

                <div className="rounded-[20px] border border-black/[0.05] bg-white p-4 shadow-[0_12px_36px_-28px_rgba(0,0,0,0.08)] sm:rounded-[22px] sm:p-5">
                  <div className="flex items-center gap-1.5 text-black/40">
                    <Gauge
                      className="size-[15px] text-sage sm:size-[17px]"
                      aria-hidden
                    />
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                      Glycemic index
                    </span>
                  </div>
                  <p className="font-display mt-2 text-xl text-sage sm:mt-3 sm:text-2xl">
                    {result.meal_analysis.glycemic_index}
                  </p>
                </div>

                <div
                  className={cn(
                    "rounded-[20px] border p-4 shadow-[0_12px_36px_-28px_rgba(0,0,0,0.06)] sm:rounded-[22px] sm:p-5",
                    result.meal_analysis.is_balanced
                      ? "border-black/[0.05] bg-white"
                      : "border-accent-orange/30 bg-[#fdf6f0]",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      result.meal_analysis.is_balanced
                        ? "text-black/40"
                        : "text-accent-orange",
                    )}
                  >
                    <Scale
                      className={cn(
                        "size-[15px] sm:size-[17px]",
                        result.meal_analysis.is_balanced
                          ? "text-sage"
                          : "text-accent-orange",
                      )}
                      aria-hidden
                    />
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-wider sm:text-xs">
                      Balance
                    </span>
                  </div>
                  <p
                    className={cn(
                      "font-display mt-2 text-xl sm:mt-3 sm:text-2xl",
                      result.meal_analysis.is_balanced
                        ? "text-sage"
                        : "text-accent-orange",
                    )}
                  >
                    {result.meal_analysis.is_balanced
                      ? "Balanced"
                      : "Adjust next bite"}
                  </p>
                </div>
              </motion.div>

              {/* Macros strip - full width */}
              <motion.div variants={bentoItem} className="lg:col-span-12">
                <MacroStrip macros={result.meal_analysis.macros} />
              </motion.div>

              {/* Ingredients gallery */}
              <motion.div variants={bentoItem} className="lg:col-span-12">
                <div className="rounded-[22px] border border-black/[0.05] bg-white p-4 shadow-[0_14px_48px_-36px_rgba(45,79,30,0.12)] sm:rounded-[24px] sm:p-6">
                  <div className="mb-4 flex items-center gap-2 sm:mb-5">
                    <Flame
                      className="size-[18px] text-accent-orange sm:size-5"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <h2 className="font-display text-xl text-sage sm:text-2xl">
                      On your plate
                    </h2>
                  </div>
                  <IngredientCards items={result.meal_analysis.items} />
                </div>
              </motion.div>

              {/* Editorial note */}
              <motion.div variants={bentoItem} className="lg:col-span-12">
                <DietitianNoteCard text={result.meal_analysis.summary} />
              </motion.div>
            </motion.div>
          </section>
        )}
      </div>
    </main>
  );
}

export default App;
