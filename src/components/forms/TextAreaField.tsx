import type { TextareaHTMLAttributes } from "react"

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  id: string
  error?: string
}

export default function TextAreaField({
  label,
  id,
  error,
  className = "",
  rows = 5,
  ...rest
}: TextAreaFieldProps) {
  const length = typeof rest.value === "string" ? rest.value.length : 0

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full resize-y rounded-2xl border bg-white/60 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/20 dark:bg-white/10 dark:text-white ${
          error ? "border-red-400" : "border-slate-300 dark:border-white/20"
        } ${className}`}
        {...rest}
      />

      <div className="mt-1.5 flex items-start justify-between gap-3">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        ) : (
          <span />
        )}
        {rest.maxLength && (
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            {length}/{rest.maxLength}
          </span>
        )}
      </div>
    </div>
  )
}