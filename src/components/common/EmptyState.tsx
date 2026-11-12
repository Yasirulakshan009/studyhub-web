interface EmptyStateProps {
    title: string
    description?: string
    actionLabel?: string
    onAction?: () => void
  }
  
  export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
      <div className="glass mx-auto flex max-w-lg flex-col items-center rounded-[2rem] px-8 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-2xl">
          📄
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="btn-primary mt-6">
            {actionLabel}
          </button>
        )}
      </div>
    )
  }