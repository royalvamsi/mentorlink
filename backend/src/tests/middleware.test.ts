import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { verifyToken } from '../middleware/verifyToken'
import { authorizeRoles } from '../middleware/authorizeRoles'
import { requireAdmin } from '../middleware/requireAdmin'
import { env } from '../config/env'
import type { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from '../types/auth.types'

function mockResponse() {
  const res: Partial<Response> & { statusCode: number; jsonData: unknown } = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code
      return this as Response
    },
    json(data: unknown) {
      this.jsonData = data
      return this as Response
    },
  }
  return res
}

describe('Phase 18 — Middleware Security Tests', () => {
  describe('verifyToken middleware', () => {
    it('should reject requests with missing Authorization header (401)', () => {
      const req = { headers: {} } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      verifyToken(req, res as unknown as Response, next)

      assert.equal(res.statusCode, 401)
      assert.deepEqual(res.jsonData, { status: 'error', message: 'Authentication token required' })
      assert.equal(nextCalled, false)
    })

    it('should reject requests with malformed Authorization header (401)', () => {
      const req = { headers: { authorization: 'Basic 12345' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      verifyToken(req, res as unknown as Response, next)

      assert.equal(res.statusCode, 401)
      assert.equal(nextCalled, false)
    })

    it('should reject requests with invalid token signature (401)', () => {
      const req = { headers: { authorization: 'Bearer invalid.token.value' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      verifyToken(req, res as unknown as Response, next)

      assert.equal(res.statusCode, 401)
      assert.deepEqual(res.jsonData, { status: 'error', message: 'Invalid token' })
      assert.equal(nextCalled, false)
    })

    it('should accept requests with valid JWT and populate req.user', () => {
      const payload: JwtPayload = { userId: '507f1f77bcf86cd799439011', role: 'SENIOR' }
      const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' })
      const req = { headers: { authorization: `Bearer ${token}` } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      verifyToken(req, res as unknown as Response, next)

      assert.equal(nextCalled, true)
      assert.ok(req.user)
      assert.equal(req.user.userId, payload.userId)
      assert.equal(req.user.role, payload.role)
    })
  })

  describe('authorizeRoles middleware', () => {
    it('should allow users with permitted role', () => {
      const req = { user: { userId: '123', role: 'SENIOR' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      const middleware = authorizeRoles('SENIOR', 'ALUMNI')
      middleware(req, res as unknown as Response, next)

      assert.equal(nextCalled, true)
      assert.equal(res.statusCode, 200)
    })

    it('should block users with unpermitted role (403 Forbidden)', () => {
      const req = { user: { userId: '123', role: 'JUNIOR' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      const middleware = authorizeRoles('SENIOR', 'ALUMNI')
      middleware(req, res as unknown as Response, next)

      assert.equal(nextCalled, false)
      assert.equal(res.statusCode, 403)
      assert.deepEqual(res.jsonData, {
        status: 'error',
        message: 'You do not have permission to access this resource',
      })
    })
  })

  describe('requireAdmin middleware', () => {
    it('should allow ADMIN users', () => {
      const req = { user: { userId: '123', role: 'ADMIN' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      requireAdmin(req, res as unknown as Response, next)

      assert.equal(nextCalled, true)
    })

    it('should block non-ADMIN users (403 Forbidden)', () => {
      const req = { user: { userId: '123', role: 'SENIOR' } } as Request
      const res = mockResponse()
      let nextCalled = false
      const next: NextFunction = () => { nextCalled = true }

      requireAdmin(req, res as unknown as Response, next)

      assert.equal(nextCalled, false)
      assert.equal(res.statusCode, 403)
      assert.deepEqual(res.jsonData, { status: 'error', message: 'Forbidden: admins only' })
    })
  })
})
