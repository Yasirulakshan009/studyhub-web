import { useAppSelector } from "./redux"

export const useAuth = () => {
  const { user, initializing, loading, error } = useAppSelector((state) => state.auth)
  const isAdmin = user?.roles.includes("ADMIN") ?? false

  return { user, initializing, loading, error, isAdmin }
}