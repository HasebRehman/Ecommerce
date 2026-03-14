import axios from 'axios'

const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  }
  return ''
}

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api