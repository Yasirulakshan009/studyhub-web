import { useState, type InputHTMLAttributes } from "react"

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
}

export default function InputField({
  label,
  id,
  error,
  type = "text",
  className = "",
  ...rest
}: InputFieldProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = type === "password"

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-2xl border bg-white/60 px-4 py-2.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-brand/20 dark:bg-white/10 dark:text-white ${
            isPassword ? "pr-16" : ""
          } ${error ? "border-red-400" : "border-slate-300 dark:border-white/20"} ${className}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-3 my-auto h-8 rounded-full px-2 text-xs font-semibold text-slate-500 transition hover:text-brand dark:text-slate-400"
          >
            {visible ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  )
}