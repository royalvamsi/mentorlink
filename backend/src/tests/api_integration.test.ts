import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'
import { env } from '../config/env'
import type { JwtPayload } from '../types/auth.types'

describe('Phase 18 — API Integration & Security Boundary Tests', () => {
  it('GET /api/health — should return 200 with status ok', async () => {
    const res = await request(app).get('/api/health')
    assert.equal(res.status, 200)
    assert.equal(res.body.status, 'ok')
    assert.ok(res.body.timestamp)
  })

  it('GET /api/nonexistent-route — should return 404 Route not found', async () => {
    const res = await request(app).get('/api/nonexistent-route')
    assert.equal(res.status, 404)
    assert.deepEqual(res.body, { status: 'error', message: 'Route not found' })
  })

  describe('Unauthenticated Request Protection (401)', () => {
    const protectedRoutes = [
      { method: 'get', path: '/api/profile/me' },
      { method: 'get', path: '/api/mentors' },
      { method: 'get', path: '/api/mentorships/active' },
      { method: 'get', path: '/api/chat/conversations' },
      { method: 'get', path: '/api/scheduling/bookings' },
      { method: 'get', path: '/api/goals' },
      { method: 'get', path: '/api/notifications' },
      { method: 'get', path: '/api/admin/stats' },
      { method: 'get', path: '/api/matching' },
      { method: 'get', path: '/api/search?q=react' },
    ]

    for (const route of protectedRoutes) {
      it(`${route.method.toUpperCase()} ${route.path} — should reject unauthenticated requests with 401`, async () => {
        const res = await (request(app) as unknown as Record<string, (p: string) => request.Test>)[route.method]!(route.path)
        assert.equal(res.status, 401)
        assert.equal(res.body.status, 'error')
      })
    }
  })

  describe('Admin Authorization Guard (403)', () => {
    it('GET /api/admin/stats — should reject non-ADMIN user with 403 Forbidden', async () => {
      const juniorPayload: JwtPayload = { userId: '507f1f77bcf86cd799439011', role: 'JUNIOR' }
      const token = jwt.sign(juniorPayload, env.JWT_SECRET, { expiresIn: '1h' })

      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${token}`)

      assert.equal(res.status, 403)
      assert.equal(res.body.message, 'Forbidden: admins only')
    })
  })

  describe('Public Registration Security Validation', () => {
    it('POST /api/auth/register — should reject ADMIN role self-registration with 400', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker',
          email: 'hacker@college.edu',
          password: 'Password123!',
          role: 'ADMIN',
        })

      assert.equal(res.status, 400)
      assert.ok(res.body.message.includes('Role must be one of'))
    })

    it('POST /api/auth/register — should reject registration with password < 8 chars', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student',
          email: 'student@college.edu',
          password: 'short',
          role: 'JUNIOR',
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.message, 'Password must be at least 8 characters')
    })

    it('POST /api/auth/register — should reject registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'student@college.edu',
        })

      assert.equal(res.status, 400)
    })

    it('POST /api/auth/register — should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Student',
          email: 'not-an-email',
          password: 'Password123!',
          role: 'JUNIOR',
        })

      assert.equal(res.status, 400)
      assert.equal(res.body.message, 'Invalid email format')
    })
  })

  describe('Security Headers (Helmet)', () => {
    it('should include standard security response headers', async () => {
      const res = await request(app).get('/api/health')
      assert.ok(res.headers['x-content-type-options'])
      assert.ok(res.headers['x-dns-prefetch-control'])
    })
  })
})
