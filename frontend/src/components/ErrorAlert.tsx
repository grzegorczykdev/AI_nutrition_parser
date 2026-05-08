interface ErrorAlertProps {
  message: string
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      {message}
    </div>
  )
}
