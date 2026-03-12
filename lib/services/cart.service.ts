import api from '@/lib/axios'
import { API } from '@/constants/api'

export const cartService = {
  async getCart() {
    const response = await api.get(API.STORE.CART)
    return response.data
  },

  async addToCart(product_id: string, quantity = 1) {
    const response = await api.post(API.STORE.CART, { product_id, quantity })
    return response.data
  },

  async updateQuantity(id: string, quantity: number) {
    const response = await api.put(API.STORE.CART_ITEM(id), { quantity })
    return response.data
  },

  async removeFromCart(id: string) {
    const response = await api.delete(API.STORE.CART_ITEM(id))
    return response.data
  },
}