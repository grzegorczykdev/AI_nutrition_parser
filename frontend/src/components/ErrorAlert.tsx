import { AlertTriangle } from "lucide-react"

interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="flex gap-2.5 rounded-[18px] border border-accent-orange/35 bg-accent-orange/[0.08] px-4 py-3 shadow-[0_10px_32px_-22px_rgba(230,126,34,0.3)] sm:gap-3 sm:rounded-[22px] sm:px-5 sm:py-4">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-orange sm:h-5 sm:w-5" aria-hidden />
      <p className="font-sans text-xs leading-relaxed text-black/80 sm:text-sm">{message}</p>
    </div>
  )
}
