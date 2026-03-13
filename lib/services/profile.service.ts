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
  }) {
    const response = await api.put(API.USERS.PROFILE, data)
    return response.data
  },
}