import axios from 'axios'
import { tokenStorage } from './tokenStorage'

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalize errors in one place
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let cancelled requests pass through untouched (needed for Phase 11)
    if (axios.isCancel(error)) {
      return Promise.reject(error)
    }

    let message = 'Something went wrong. Please try again.'

    if (error.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.'
    } else if (!error.response) {
      message = 'Network error. Check your internet connection.'
    } else if (error.response.data?.message) {
      message = error.response.data.message
    }

    return Promise.reject({
      message,
      status: error.response?.status ?? null,
    })
  }
)

export default api