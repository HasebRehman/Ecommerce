import api from '@/lib/axios'
import { API } from '@/constants/api'

export const shopService = {

  async getShops() {
    const response = await api.get(API.SHOPS.LIST)
    return response.data
  },

  async getShop(id: string) {
    const response = await api.get(API.SHOPS.DETAIL(id))
    return response.data
  },

  async createShop(data: {
    name:        string
    description?: string
    logo_url?:   string
    banner_url?: string
  }) {
    const response = await api.post(API.SHOPS.LIST, data)
    return response.data
  },

  async updateShop(id: string, data: any) {
    const response = await api.put(API.SHOPS.DETAIL(id), data)
    return response.data
  },

  async deleteShop(id: string) {
    const response = await api.delete(API.SHOPS.DETAIL(id))
    return response.data
  },

  async getShopProducts(id: string) {
    const response = await api.get(API.SHOPS.PRODUCTS(id))
    return response.data
  },

  async updateShopProducts(id: string, productIds: string[]) {
    const response = await api.post(API.SHOPS.PRODUCTS(id), { productIds })
    return response.data
  },

  async updateStatus(id: string, status: 'draft' | 'live' | 'paused') {
    const response = await api.put(API.SHOPS.STATUS(id), { status })
    return response.data
  },
}