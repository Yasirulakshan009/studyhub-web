import { useState, type FormEvent } from "react"
import { Link, useSearchParams } from "react-router-dom"
import InputField from "../components/forms/InputField"
import { getErrorMessage } from "../service/api"
import { resetPasswordRequest } from "../service/auth"

const MIN_PASSWORD = 6

interface FieldErrors {
  password?: string
  confirm?: string
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const tokenLooksValid = /^[a-f0-9]{64}$/.test(token)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const found: FieldErrors = {}
    if (password.length < MIN_PASSWORD) {
      found.password = `Password must be at least ${MIN_PASSWORD} characters`
    }
    if (confirm !== password) {
      found.confirm = "Passwords do not match"
    }

    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      await resetPasswordRequest(token, password)
      setDone(true)
    } catch (error) {
      setServerError(getErrorMessage(error, "Could not reset your password. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  if (!tokenLooksValid) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Invalid reset link</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            This link is missing or incomplete. Ask for a new one and use the link from the latest
            email.
          </p>
          <Link to="/forgot-password" className="btn-primary mt-8">
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md py-8">
        <div className="glass rounded-[2rem] p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600 dark:text-emerald-300">
            ✓
          </div>
          <h1 className="mt-5 text-3xl font-semibold tracking-tight">Password updated</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Your password has been changed. You can now log in with the new one.
          </p>
          <Link to="/login" className="btn-primary mt-8">
            Log in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="glass rounded-[2rem] p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a new password</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Pick a password you have not used before. At least {MIN_PASSWORD} characters.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <InputField
            label="New password"
            id="reset-password"
            type="password"
            autoComplete="new-password"
            placeholder={`At least ${MIN_PASSWORD} characters`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <InputField
            label="Confirm new password"
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={errors.confirm}
          />

          {serverError && (
            <div
              role="alert"
              className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              <p>{serverError}</p>
              <Link to="/forgot-password" className="mt-1 inline-block font-medium underline">
                Request a new reset link
              </Link>
            </div>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  )
}