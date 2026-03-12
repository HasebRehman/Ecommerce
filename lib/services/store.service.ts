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

  async getFeaturedProducts() {
    const response = await api.get(API.STORE.FEATURED)
    return response.data
  },

  async getDiscountedProducts() {
    const response = await api.get(API.STORE.DISCOUNTED)
    return response.data
  },

  async getTopShops() {
    const response = await api.get(API.STORE.TOP_SHOPS)
    return response.data
  },
}