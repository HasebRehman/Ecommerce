import api from '@/lib/axios'
import { API } from '@/constants/api'

export const wishlistService = {
  async getWishlist() {
    const response = await api.get(API.STORE.WISHLIST)
    return response.data
  },

  async addToWishlist(product_id: string) {
    const response = await api.post(API.STORE.WISHLIST, { product_id })
    return response.data
  },

  async removeFromWishlist(product_id: string) {
    const response = await api.delete(API.STORE.WISHLIST_ITEM(product_id))
    return response.data
  },
}