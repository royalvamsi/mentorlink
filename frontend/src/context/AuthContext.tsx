import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react'
import { authService } from '../services/authService'
import type { AuthState, LoginData, RegisterData, User } from '../types/auth'

// ─── State & Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User; token: string } }
  | { type: 'CLEAR_USER' }

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'CLEAR_USER':
      return { user: null, token: null, isAuthenticated: false, isLoading: false }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('ml_token'),
  isLoading: true,
  isAuthenticated: false,
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  // Hydrate auth state from stored token on mount
  useEffect(() => {
    const token = localStorage.getItem('ml_token')
    if (!token) {
      dispatch({ type: 'CLEAR_USER' })
      return
    }
    authService
      .getMe()
      .then((user) => dispatch({ type: 'SET_USER', payload: { user, token } }))
      .catch(() => {
        localStorage.removeItem('ml_token')
        dispatch({ type: 'CLEAR_USER' })
      })
  }, [])

  const login = useCallback(async (data: LoginData) => {
    const result = await authService.login(data)
    localStorage.setItem('ml_token', result.token)
    dispatch({ type: 'SET_USER', payload: { user: result.user, token: result.token } })
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    const result = await authService.register(data)
    localStorage.setItem('ml_token', result.token)
    dispatch({ type: 'SET_USER', payload: { user: result.user, token: result.token } })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ml_token')
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
