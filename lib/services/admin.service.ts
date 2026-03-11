import api from '@/lib/axios'
import { API } from '@/constants/api'

export const adminService = {

  // Get dashboard stats
  async getStats() {
    const response = await api.get(API.ADMIN.STATS)
    return response.data
  },

  // Get all users
  async getUsers(params?: {
    search?: string
    role?:   string
    page?:   number
  }) {
    const response = await api.get(API.ADMIN.USERS, { params })
    return response.data
  },

  // Get single user
  async getUser(id: string) {
    const response = await api.get(API.ADMIN.USER_DETAIL(id))
    return response.data
  },

  // Get all role requests
  async getRoleRequests() {
    const response = await api.get(API.ADMIN.ROLE_REQUESTS)
    return response.data
  },

  // Approve or reject a role request
  async reviewRoleRequest(
    id:           string,
    action:       'approve' | 'reject',
    review_notes?: string
  ) {
    const response = await api.put(API.ADMIN.ROLE_REQUEST(id), {
      action,
      review_notes,
    })
    return response.data
  },

}