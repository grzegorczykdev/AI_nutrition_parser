import { motion } from "framer-motion"

export function LoadingPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="h-3 w-3 rounded-full bg-emerald-500"
          animate={{ scale: [1, 1.35, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.3 }}
        />
        <p className="text-sm font-medium text-slate-600">
          AI nutritionist is analyzing your meal...
        </p>
      </div>
    </motion.div>
  )
}
