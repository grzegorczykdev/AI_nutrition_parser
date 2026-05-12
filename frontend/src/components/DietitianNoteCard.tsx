import { Quote } from "lucide-react"

interface DietitianNoteCardProps {
  text: string
}

export function DietitianNoteCard({ text }: DietitianNoteCardProps) {
  return (
    <article className="pulse-editorial bg-editorial-grain relative overflow-hidden rounded-[20px] border border-black/[0.06] p-5 shadow-[0_12px_36px_-22px_rgba(0,0,0,0.1)] sm:rounded-[22px] sm:p-6">
      <Quote
        className="absolute right-4 top-4 h-10 w-10 text-sage/[0.12] sm:right-5 sm:top-5 sm:h-12 sm:w-12"
        strokeWidth={1}
        aria-hidden
      />
      <p className="font-display text-[10px] font-normal uppercase tracking-[0.22em] text-sage/70 sm:text-xs sm:tracking-[0.25em]">
        Editorial note
      </p>
      <p className="font-sans mt-3 text-sm leading-relaxed text-black/80 sm:mt-4 sm:text-base">{text}</p>
    </article>
  )
}
