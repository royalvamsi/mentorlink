// --- User / Role -------------------------------------------------------------

export type UserRole = 'JUNIOR' | 'SENIOR' | 'ALUMNI'

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
  role: UserRole
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
