import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"
import InputField from "../components/forms/InputField"
import { getErrorMessage } from "../service/api"
import { forgotPasswordRequest } from "../service/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [fieldError, setFieldError] = useState<string | undefined>()
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const clean = email.trim()

    if (!clean) {
      setFieldError("Email is required")
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(clean)) {
      setFieldError("Enter a valid email address")
      return
    }

    setFieldError(undefined)
    setSubmitting(true)

    try {
      await forgotPasswordRequest(clean)
      setSentTo(clean)
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not send the reset link. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl">
            ✉️
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Check your email</h1>
          <p className="mt-2 break-words text-slate-500 dark:text-slate-400">
            If an account exists for <span className="font-medium text-slate-700 dark:text-slate-200">{sentTo}</span>,
            we have sent a link to reset your password. It works for 30 minutes.
          </p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Nothing in your inbox? Check the spam folder.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/login" className="btn-primary">
              Back to log in
            </Link>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="rounded-full border border-slate-300 bg-white/50 px-6 py-2.5 text-sm font-semibold transition hover:border-brand hover:text-brand dark:border-white/20 dark:bg-white/10"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="glass rounded-[2rem] p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Forgot your password?</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Enter your email and we will send you a link to choose a new one.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <InputField
            label="Email"
            id="forgot-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setFieldError(undefined)
            }}
            error={fieldError}
          />

          {serverError && (
            <p
              role="alert"
              className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {serverError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Remembered it?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  )
}