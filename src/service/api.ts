import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const ACCESS_TOKEN_KEY = "ACCESS_TOKEN"
export const REFRESH_TOKEN_KEY = "REFRESH_TOKEN"

const api = axios.create({ baseURL: BASE_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined
    const isAuthCall =
      original?.url?.includes("/auth/login") || original?.url?.includes("/auth/register")

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)
      if (!refreshToken) {
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newAccessToken: string = res.data.data.accessToken

        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
        original.headers.Authorization = `Bearer ${newAccessToken}`

        return api(original)
      } catch {
        localStorage.removeItem(ACCESS_TOKEN_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        window.location.href = "/login"
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as { message?: string } | undefined
      return data?.message ?? fallback
    }
    return fallback
  }