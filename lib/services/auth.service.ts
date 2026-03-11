import api from '@/lib/axios'
import { API } from '@/constants/api'
import type { SignupFormData, LoginFormData } from '@/lib/validations/auth.schema'

export const authService = {

  async signup(data: SignupFormData) {
    const response = await api.post(API.AUTH.SIGNUP, {
      full_name: data.full_name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password,
    })
    return response.data
  },

  async login(data: LoginFormData) {
    const response = await api.post(API.AUTH.LOGIN, {
      email: data.email,
      password: data.password,
    })
    return response.data
  },

  async logout() {
    const response = await api.post(API.AUTH.LOGOUT)
    return response.data
  },

  async getMe() {
    const response = await api.get(API.AUTH.ME)
    return response.data
  },
}