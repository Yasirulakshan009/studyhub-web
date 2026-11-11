import { useEffect, useState, type FormEvent } from "react"
import { Link, Navigate, useLocation } from "react-router-dom"
import InputField from "../components/forms/InputField"
import { useAppDispatch } from "../hooks/redux"
import { useAuth } from "../hooks/useAuth"
import { clearError, login } from "../store/authSlice"

interface LocationState {
  from?: { pathname: string }
}

interface FieldErrors {
  email?: string
  password?: string
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { user, loading, error } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const from = (location.state as LocationState | null)?.from?.pathname ?? "/"

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const errors: FieldErrors = {}
    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email address"
    }
    if (!password) {
      errors.password = "Password is required"
    }

    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      return
    }

    dispatch(login({ email: email.trim(), password }))
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="glass rounded-[2rem] p-8">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Log in to upload and download notes.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
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
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
          />

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          New to StudyHub?{" "}
          <Link to="/register" className="font-medium text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}