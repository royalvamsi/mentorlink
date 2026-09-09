import axios from 'axios'
import type {
  AuthResponse,
  LoginData,
  MeResponse,
  RegisterData,
  User,
  ForgotPasswordData,
  ForgotPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
} from '../types/auth'

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

// Auto-logout on 401 — clears stale token and sends user back to login
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const url = error.config?.url ?? ''
      const isAuthAction =
        url.includes('/api/auth/login') ||
        url.includes('/api/auth/register') ||
        url.includes('/api/auth/forgot-password') ||
        url.includes('/api/auth/reset-password')

      if (!isAuthAction) {
        const hadToken = Boolean(localStorage.getItem('ml_token'))
        if (hadToken) {
          localStorage.removeItem('ml_token')
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

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

  async forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
    const res = await api.post<ForgotPasswordResponse>('/api/auth/forgot-password', data)
    return res.data
  },

  async resetPassword(data: ResetPasswordData): Promise<ResetPasswordResponse> {
    const res = await api.post<ResetPasswordResponse>('/api/auth/reset-password', data)
    return res.data
  },
}

export { api }

