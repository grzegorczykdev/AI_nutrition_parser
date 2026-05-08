import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Salad, NotebookPen, Activity, Gauge, Scale } from "lucide-react";
import { analyzeMeal, ApiError } from "./api/analyzeMeal";
import { ErrorAlert } from "./components/ErrorAlert";
import { IngredientCards } from "./components/IngredientCards";
import { LoadingPulse } from "./components/LoadingPulse";
import type { AnalyzeResponse } from "./types/nutrition";

function App() {
  const [mealDescription, setMealDescription] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(
    () => !isLoading && mealDescription.trim().length > 5,
    [isLoading, mealDescription],
  );

  const handleAnalyzeMeal = async () => {
    if (!canSubmit) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const data = await analyzeMeal(mealDescription.trim());
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-4xl border border-slate-200/80 bg-white/85 p-6 shadow-[0_18px_70px_-38px_rgba(29,54,36,0.45)] backdrop-blur-sm sm:p-8">
        <div className="mx-auto max-w-3xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700">
            <Sparkles size={14} />
            AI Nutrition Analyzer
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Describe your meal, get instant nutrition insights
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Paste any meal description and receive calorie estimates, ingredient
            breakdown, and a professional health assessment.
          </p>

          <div className="mt-6">
            <label
              htmlFor="meal-description"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Meal description
            </label>
            <textarea
              id="meal-description"
              value={mealDescription}
              onChange={(event) => setMealDescription(event.target.value)}
              placeholder="Example: Grilled salmon with quinoa, avocado, steamed broccoli and olive oil dressing."
              rows={6}
              className="w-full resize-none rounded-2xl border border-slate-200 bg-[#fbfcfa] px-4 py-3 text-sm leading-relaxed text-slate-800 shadow-inner outline-none transition focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100 sm:text-base"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAnalyzeMeal}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <Salad size={16} />
              Analyze meal
            </button>
          </div>

          {errorMessage && (
            <div className="mt-4">
              <ErrorAlert message={errorMessage} />
            </div>
          )}
        </div>
      </section>

      {isLoading && (
        <div className="mt-6">
          <LoadingPulse />
        </div>
      )}

      {result && !isLoading && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mt-6 grid gap-4 md:grid-cols-5"
        >
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Metabolic snapshot
            </h2>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                <p className="text-xs uppercase tracking-wider text-emerald-700">
                  Total calories
                </p>
                <p className="mt-1 text-2xl font-semibold text-emerald-800">
                  {result.total_calories} kcal
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                  <Gauge size={14} className="text-emerald-700" />
                  Glycemic index
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-800">
                  {result.glycemic_index}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
                  <Scale size={14} className="text-emerald-700" />
                  Meal balance
                </p>
                <p
                  className={`mt-1 text-lg font-semibold ${
                    result.is_balanced ? "text-emerald-700" : "text-amber-600"
                  }`}
                >
                  {result.is_balanced ? "Balanced" : "Not balanced"}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Ingredients
            </h2>
            <div className="mt-4">
              <IngredientCards items={result.items} />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Activity size={16} className="text-emerald-700" />
              Macronutrients
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Protein</p>
                <p className="mt-1 text-xl font-semibold text-slate-800">
                  {result.macros.protein} g
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Fat</p>
                <p className="mt-1 text-xl font-semibold text-slate-800">
                  {result.macros.fat} g
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wider text-slate-500">Carbs</p>
                <p className="mt-1 text-xl font-semibold text-slate-800">
                  {result.macros.carbs} g
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <NotebookPen size={16} className="text-emerald-700" />
              Dietitian note
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:text-base">
              {result.summary}
            </p>
          </article>
        </motion.section>
      )}
    </main>
  );
}

export default App;
