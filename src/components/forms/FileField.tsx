import { useState, type ChangeEvent, type DragEvent } from "react"
import { formatSize } from "../../utils/format"

interface FileFieldProps {
  label: string
  id: string
  file: File | null
  onChange: (file: File | null) => void
  error?: string
  accept?: string
  hint?: string
}

export default function FileField({
  label,
  id,
  file,
  onChange,
  error,
  accept = "application/pdf",
  hint
}: FileFieldProps) {
  const [dragging, setDragging] = useState(false)

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0] ?? null
    e.target.value = ""
    if (picked) onChange(picked)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0] ?? null
    if (dropped) onChange(dropped)
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>

      {file ? (
        <div className="glass flex items-center gap-4 rounded-2xl p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-xs font-bold text-brand">
            PDF
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <input
            id={id}
            type="file"
            accept={accept}
            onChange={handleInput}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer sr-only"
          />
          <label
            htmlFor={id}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition peer-focus-visible:ring-4 peer-focus-visible:ring-brand/20 ${
              dragging
                ? "border-brand bg-brand/10"
                : error
                  ? "border-red-400"
                  : "border-slate-300 bg-white/40 hover:border-brand dark:border-white/25 dark:bg-white/5"
            }`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
              </svg>
            </span>
            <span className="text-sm font-medium">
              <span className="text-brand">Choose a PDF</span> or drag it here
            </span>
            {hint && <span className="text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
          </label>
        </>
      )}

      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}