import api from '@/lib/axios'
import { API } from '@/constants/api'

export const orderService = {
  async placeOrder(data: {
    items:            any[]
    delivery_address: any
    notes?:           string
    payment_method:   string
  }) {
    const response = await api.post(API.STORE.ORDERS, data)
    return response.data
  },

  async getOrders() {
    const response = await api.get(API.STORE.ORDERS)
    return response.data
  },
}