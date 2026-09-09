// --- User / Role -------------------------------------------------------------

export type UserRole = 'JUNIOR' | 'SENIOR' | 'ALUMNI' | 'ADMIN'
export type RegisterRole = 'JUNIOR' | 'SENIOR' | 'ALUMNI'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: string
}

// --- Auth State ---------------------------------------------------------------

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

// --- Request / Response Shapes ------------------------------------------------

export interface RegisterData {
  name: string
  email: string
  password: string
  role: RegisterRole
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  status: string
  message?: string
  data: {
    token: string
    user: User
  }
}

export interface MeResponse {
  status: string
  data: User
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
}

export interface ForgotPasswordResponse {
  status: string
  message: string
  data?: {
    message: string
    resetToken?: string
    resetUrl?: string
  }
}

export interface ResetPasswordResponse {
  status: string
  message: string
}

