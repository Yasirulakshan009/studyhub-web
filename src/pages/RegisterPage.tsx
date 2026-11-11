import { useState, type FormEvent } from "react"
import { Link, Navigate } from "react-router-dom"
import InputField from "../components/forms/InputField"
import { useAppDispatch } from "../hooks/redux"
import { useAuth } from "../hooks/useAuth"
import { getErrorMessage } from "../service/api"
import { registerRequest } from "../service/auth"
import { login } from "../store/authSlice"

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export default function RegisterPage() {
  const dispatch = useAppDispatch()
  const { user } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const errors: FieldErrors = {}
    if (name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email address"
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      await registerRequest(name.trim(), email.trim(), password)
      await dispatch(login({ email: email.trim(), password })).unwrap()
    } catch (err) {
      setServerError(typeof err === "string" ? err : getErrorMessage(err, "Registration failed"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="glass rounded-[2rem] p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Join StudyHub to share and download notes.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          <InputField
            label="Full name"
            id="name"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name}
          />

          <InputField
            label="Email"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
          />

          <InputField
            label="Password"
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          <InputField
            label="Confirm password"
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
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
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}