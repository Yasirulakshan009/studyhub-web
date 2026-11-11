import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

interface RequireAuthProps {
  adminOnly?: boolean
}

export default function RequireAuth({ adminOnly = false }: RequireAuthProps) {
  const { user, isAdmin, initializing } = useAuth()
  const location = useLocation()

  if (initializing) {
    return (
      <div className="flex justify-center py-24">
        <div
          role="status"
          aria-label="Loading"
          className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}