import api from '@/lib/axios'
import { API } from '@/constants/api'

export const profileService = {

  // Get current user profile
  async getProfile() {
    const response = await api.get(API.USERS.PROFILE)
    return response.data
  },

  // Update profile
  async updateProfile(data: {
    full_name?: string
    username?: string
    phone?: string
    bio?: string
  }) {
    const response = await api.put(API.USERS.PROFILE, data)
    return response.data
  },

  // Upload avatar
  async uploadAvatar(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(API.USERS.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}