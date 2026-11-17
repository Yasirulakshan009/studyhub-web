
import api from "./api"
import type { PublicProfileResponse } from "../types"

export const getPublicProfile = async (
  userId: string,
  page = 1,
  limit = 12
): Promise<PublicProfileResponse> => {
  const response = await api.get(`/users/${userId}/profile`, {
    params: { page, limit }
  })

  return response.data.data
}
