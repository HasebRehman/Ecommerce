import api from '@/lib/axios'
import { API } from '@/constants/api'

export const storeService = {
  async getProducts(params?: {
    search?:      string
    category_id?: string
    page?:        number
  }) {
    const response = await api.get(API.STORE.PRODUCTS, { params })
    return response.data
  },
}