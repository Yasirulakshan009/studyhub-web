import api from "./api"
import type { ApiResponse, Category } from "../types"


export interface CategoryInput {
  name: string
  description?: string
  parentId?: string | null
}

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

export const createCategory = async (input: CategoryInput) => {
  const res = await api.post<ApiResponse<Category>>("/categories", input)
  return res.data.data
}

export const updateCategory = async (id: string, input: { name?: string; description?: string }) => {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, input)
  return res.data.data
}

export const deleteCategory = async (id: string) => {
  await api.delete(`/categories/${id}`)
}