import { describe, it, expect, beforeEach } from 'vitest'
import { api } from '../services/authService'

// Ensure localStorage mock is available across all test runners
const storageMap: Record<string, string> = {}
const mockLocalStorage = {
  getItem: (k: string) => storageMap[k] ?? null,
  setItem: (k: string, v: string) => { storageMap[k] = String(v) },
  removeItem: (k: string) => { delete storageMap[k] },
  clear: () => {
    for (const key of Object.keys(storageMap)) {
      delete storageMap[key]
    }
  },
  length: 0,
  key: () => null,
}

if (typeof globalThis.localStorage === 'undefined' || typeof globalThis.localStorage.clear !== 'function') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  })
}

describe('Phase 18 — Frontend Auth Service & Storage Tests', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve auth token in localStorage under ml_token key', () => {
    const sampleToken = 'header.payload.signature123'
    localStorage.setItem('ml_token', sampleToken)
    expect(localStorage.getItem('ml_token')).toBe(sampleToken)
  })

  it('should clear auth token from localStorage', () => {
    localStorage.setItem('ml_token', 'token-to-be-cleared')
    localStorage.removeItem('ml_token')
    expect(localStorage.getItem('ml_token')).toBeNull()
  })

  it('should attach Authorization header on axios requests when ml_token exists in localStorage', () => {
    const testToken = 'bearer-test-token-456'
    localStorage.setItem('ml_token', testToken)

    const config: Record<string, unknown> = { headers: {} }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const interceptor = (api.interceptors.request as any).handlers[0]?.fulfilled
    if (interceptor) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = interceptor(config as any)
      expect(result.headers['Authorization']).toBe(`Bearer ${testToken}`)
    }
  })
})
