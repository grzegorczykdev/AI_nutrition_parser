import { motion } from "framer-motion";

export function LoadingPulse() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-[20px] p-5 shadow-[0_16px_48px_-28px_rgba(45,79,30,0.18)] sm:rounded-[22px] sm:p-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <motion.div
          className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-sage to-sage-muted sm:h-11 sm:w-11 sm:rounded-2xl"
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.4,
            ease: "easeInOut",
          }}
        />
        <div>
          <p className="font-display text-lg text-sage sm:text-xl">
            Crafting your plate analysis…
          </p>
          <p className="font-sans mt-0.5 text-xs text-black/50 sm:text-sm">
            Parsing ingredients, calories, and balance - almost there.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
