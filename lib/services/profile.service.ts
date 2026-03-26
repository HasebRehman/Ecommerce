import api from '@/lib/axios'
import { API } from '@/constants/api'

export const profileService = {
  async getProfile() {
    const response = await api.get(API.USERS.PROFILE)
    return response.data
  },

  async updateProfile(data: {
    full_name?:  string
    username?:   string
    phone?:      string
    bio?:        string
    avatar_url?: string
    banner_url?: string
  }) {
    const response = await api.put(API.USERS.PROFILE, data)
    return response.data
  },

  // ✅ OPTIONAL: Check username availability in real-time
  async checkUsernameAvailability(username: string, currentUserId?: string) {
    try {
      const response = await api.get(
        `${API.USERS.PROFILE}/check-username?username=${encodeURIComponent(username)}`
      )
      return response.data
    } catch (error) {
      throw error
    }
  },
}