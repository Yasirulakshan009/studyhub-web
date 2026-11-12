interface PaginationProps {
    page: number
    totalPages: number
    onChange: (page: number) => void
  }
  
  const getPages = (page: number, totalPages: number) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4))
    const end = Math.min(totalPages, start + 4)
    const pages: number[] = []
    for (let p = start; p <= end; p++) {
      pages.push(p)
    }
    return pages
  }
  
  const baseClass =
    "h-10 min-w-10 rounded-full px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"
  const idleClass = "bg-white/60 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20"
  
  export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) {
      return null
    }
  
    return (
      <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className={`${baseClass} ${idleClass}`}
        >
          Previous
        </button>
  
        {getPages(page, totalPages).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${baseClass} ${p === page ? "bg-brand text-white" : idleClass}`}
          >
            {p}
          </button>
        ))}
  
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className={`${baseClass} ${idleClass}`}
        >
          Next
        </button>
      </nav>
    )
  }