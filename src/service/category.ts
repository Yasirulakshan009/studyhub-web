import api from "./api"
import type { ApiResponse, Category } from "../types"

export const getCategories = async (parentId?: string) => {
  const res = await api.get<ApiResponse<Category[]>>("/categories", {
    params: parentId ? { parentId } : undefined
  })
  return res.data.data
}

export const getCategoryById = async (id: string) => {
  const res = await api.get<ApiResponse<Category>>(`/categories/${id}`)
  return res.data.data
}