export default function LoadingSpinner({ label = "Loading" }: { label?: string }) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div
          role="status"
          aria-label={label}
          className="h-9 w-9 animate-spin rounded-full border-4 border-brand border-t-transparent"
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}...</p>
      </div>
    )
  }