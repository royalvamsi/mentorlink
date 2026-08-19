import axios from 'axios'
import type { AuthResponse, LoginData, MeResponse, RegisterData, User } from '../types/auth'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const api = axios.create({ baseURL: API_BASE })

// Attach token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ml_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/api/auth/register', data)
    return res.data.data
  },

  async login(data: LoginData): Promise<AuthResponse['data']> {
    const res = await api.post<AuthResponse>('/api/auth/login', data)
    return res.data.data
  },

  async getMe(): Promise<User> {
    const res = await api.get<MeResponse>('/api/auth/me')
    return res.data.data
  },
}

export { api }
