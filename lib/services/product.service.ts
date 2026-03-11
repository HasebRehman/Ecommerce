import api from '@/lib/axios'
import { API } from '@/constants/api'

export const productService = {

  async getProducts(params?: {
    search?:      string
    category_id?: string
    page?:        number
  }) {
    const response = await api.get(API.PRODUCTS.LIST, { params })
    return response.data
  },

  async getProduct(id: string) {
    const response = await api.get(API.PRODUCTS.DETAIL(id))
    return response.data
  },

  async createProduct(data: {
    name:           string
    description?:   string
    price:          number
    discount_price?: number
    stock:          number
    sku?:           string
    images?:        string[]
    videos?:        string[]
    category_id?:   string
    sizes?:         string[]
    colors?:        string[]
  }) {
    const response = await api.post(API.PRODUCTS.LIST, data)
    return response.data
  },

  async updateProduct(id: string, data: any) {
    const response = await api.put(API.PRODUCTS.DETAIL(id), data)
    return response.data
  },

  async deleteProduct(id: string) {
    const response = await api.delete(API.PRODUCTS.DETAIL(id))
    return response.data
  },
}