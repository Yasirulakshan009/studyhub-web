export type UserRole = "STUDENT" | "ADMIN"

export interface User {
  id: string
  name: string
  email: string
  roles: UserRole[]
}

export interface ApiResponse<T> {
  message: string
  data: T
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LoginData {
  user: User
  accessToken: string
  refreshToken: string
}

export interface Category {
  _id: string
  name: string
  description?: string
  parentId: string | null
  isActive: boolean
  isSystem: boolean
}

export type NoteStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface NoteFile {
  originalName: string
  mimeType: string
  sizeBytes: number
}

export interface Note {
  _id: string
  title: string
  description: string
  subject?: string
  tags: string[]
  categoryId: string | { _id: string; name: string }
  uploaderId: string | { _id: string; name: string }
  file?: NoteFile
  status: NoteStatus
  rejectionReason?: string
  downloadCount: number
  createdAt: string
  updatedAt: string
}