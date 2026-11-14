import api from "./api"
import type { ApiResponse, Note, Paginated } from "../types"

export type NoteSort = "newest" | "oldest" | "mostDownloaded" | "relevance"

export interface NoteFilters {
  q?: string
  categoryId?: string
  sort?: NoteSort
  page?: number
  limit?: number
}

export const getNotes = async (filters: NoteFilters = {}) => {
  const res = await api.get<ApiResponse<Paginated<Note>>>("/notes", { params: filters })
  return res.data.data
}

export const getNoteById = async (id: string) => {
  const res = await api.get<ApiResponse<Note>>(`/notes/${id}`)
  return res.data.data
}

export interface UploadNoteInput {
  title: string
  description: string
  categoryId: string
  subject?: string
  tags?: string
  ownershipConfirmed: boolean
  file: File
}

export const uploadNote = async (input: UploadNoteInput) => {
  const form = new FormData()
  form.append("title", input.title)
  form.append("description", input.description)
  form.append("categoryId", input.categoryId)
  if (input.subject) form.append("subject", input.subject)
  if (input.tags) form.append("tags", input.tags)
  form.append("ownershipConfirmed", String(input.ownershipConfirmed))
  form.append("file", input.file)

  const res = await api.post<ApiResponse<Note>>("/notes", form)
  return res.data.data
}

export const getMyNotes = async () => {
  const res = await api.get<ApiResponse<Note[]>>("/notes/mine")
  return res.data.data
}

export interface UpdateNoteInput {
  title?: string
  description?: string
  subject?: string
  tags?: string[]
  categoryId?: string
}

export const updateNote = async (id: string, input: UpdateNoteInput) => {
  const res = await api.put<ApiResponse<Note>>(`/notes/${id}`, input)
  return res.data.data
}

export const deleteNote = async (id: string) => {
  await api.delete(`/notes/${id}`)
}

export const getDownloadUrl = async (id: string) => {
  const res = await api.get<ApiResponse<{ url: string; expiresInSeconds: number }>>(
    `/notes/${id}/download`
  )
  return res.data.data.url
}

export const getPendingNotes = async (page = 1, limit = 10) => {
  const res = await api.get<ApiResponse<Paginated<Note>>>("/admin/notes/pending", {
    params: { page, limit }
  })
  return res.data.data
}

export interface ReviewInput {
  status: "APPROVED" | "REJECTED"
  rejectionReason?: string
  categoryId?: string
}

export const reviewNote = async (id: string, input: ReviewInput) => {
  const res = await api.put<ApiResponse<Note>>(`/admin/notes/${id}/review`, input)
  return res.data.data
}

export const getPreviewUrl = async (id: string) => {
  const res = await api.get<ApiResponse<{ url: string; expiresInSeconds: number }>>(
    `/notes/${id}/download`,
    { params: { preview: "true" } }
  )
  return res.data.data.url
}