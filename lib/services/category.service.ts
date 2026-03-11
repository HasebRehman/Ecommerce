import api from '@/lib/axios'
import { API } from '@/constants/api'

export const categoryService = {

  async getCategories() {
    const response = await api.get(API.CATEGORIES.LIST)
    return response.data
  },

  async createCategory(name: string) {
    const response = await api.post(API.CATEGORIES.CREATE, { name })
    return response.data
  },
}