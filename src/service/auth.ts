import api from "./api"
import type { ApiResponse, LoginData, User } from "../types"

export const loginRequest = async (email: string, password: string) => {
  const res = await api.post<ApiResponse<LoginData>>("/auth/login", { email, password })
  return res.data.data
}

export const registerRequest = async (name: string, email: string, password: string) => {
  const res = await api.post<{ message: string }>("/auth/register", { name, email, password })
  return res.data
}

export const getMyDetails = async () => {
  const res = await api.get<ApiResponse<User>>("/auth/me")
  return res.data.data
}

export interface UpdateProfileInput {
  name?: string
  email?: string
  currentPassword?: string
  newPassword?: string
}

export const updateMyProfile = async (input: UpdateProfileInput) => {
  const res = await api.put<ApiResponse<User>>("/auth/me", input)
  return res.data.data
}