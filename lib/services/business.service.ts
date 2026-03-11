import api from '@/lib/axios'
import { API } from '@/constants/api'

export const businessService = {

  async getStats() {
    const response = await api.get(API.BUSINESS.STATS)
    return response.data
  },

  async getOrders(params?: { page?: number; status?: string }) {
    const response = await api.get(API.BUSINESS.ORDERS, { params })
    return response.data
  },

  async getInventory(params?: { page?: number; search?: string }) {
    const response = await api.get(API.BUSINESS.INVENTORY, { params })
    return response.data
  },
}