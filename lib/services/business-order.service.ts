import api from '@/lib/axios'
import { API } from '@/constants/api'

export const businessOrderService = {
  async getOrders(status?: string) {
    const params = status ? { status } : {}
    const response = await api.get(API.BUSINESS.ORDERS, { params })
    return response.data
  },

  async getOrder(id: string) {
    const response = await api.get(API.BUSINESS.ORDER(id))
    return response.data
  },

  async updateStatus(id: string, status: string) {
    const response = await api.put(API.BUSINESS.ORDER(id), { status })
    return response.data
  },
}