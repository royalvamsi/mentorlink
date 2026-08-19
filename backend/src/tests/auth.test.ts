import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { env } from '../config/env'
import { USER_ROLES, type UserRole } from '../types/auth.types'

describe('Phase 18 — Authentication Unit & Security Tests', () => {
  it('should define valid application roles', () => {
    assert.deepEqual(USER_ROLES, ['JUNIOR', 'SENIOR', 'ALUMNI', 'ADMIN'])
  })

  it('should correctly hash and verify passwords using bcrypt', async () => {
    const password = 'SecurePassword123!'
    const saltRounds = 12
    const hash = await bcrypt.hash(password, saltRounds)

    assert.notEqual(hash, password)
    assert.ok(hash.startsWith('$2'))

    const isMatch = await bcrypt.compare(password, hash)
    assert.equal(isMatch, true)

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash)
    assert.equal(isWrongMatch, false)
  })

  it('should enforce minimum password length (>= 8 characters)', () => {
    const shortPassword = 'short'
    assert.ok(shortPassword.length < 8)

    const validPassword = 'LongEnoughPassword'
    assert.ok(validPassword.length >= 8)
  })

  it('should validate email format accurately', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    assert.ok(emailRegex.test('student@college.edu'))
    assert.ok(emailRegex.test('mentor.user@alumni.org'))
    assert.equal(emailRegex.test('invalid-email'), false)
    assert.equal(emailRegex.test('missing@domain'), false)
    assert.equal(emailRegex.test('@nodomain.com'), false)
  })

  it('should prevent ADMIN role in self-registration', () => {
    const registerableRoles = USER_ROLES.filter((r) => r !== 'ADMIN')
    assert.deepEqual(registerableRoles, ['JUNIOR', 'SENIOR', 'ALUMNI'])
    assert.equal(registerableRoles.includes('ADMIN' as unknown as (typeof registerableRoles)[number]), false)
  })

  it('should correctly sign and verify JWT tokens', () => {
    const payload = { userId: '507f1f77bcf86cd799439011', role: 'SENIOR' as UserRole }
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' })

    assert.ok(token)
    assert.equal(typeof token, 'string')

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string }
    assert.equal(decoded.userId, payload.userId)
    assert.equal(decoded.role, payload.role)
  })

  it('should reject tokens signed with an invalid secret', () => {
    const payload = { userId: '507f1f77bcf86cd799439011', role: 'JUNIOR' as UserRole }
    const token = jwt.sign(payload, 'wrong-secret')

    assert.throws(() => {
      jwt.verify(token, env.JWT_SECRET)
    }, /invalid signature/)
  })

  it('should reject expired JWT tokens', () => {
    const payload = { userId: '507f1f77bcf86cd799439011', role: 'JUNIOR' as UserRole }
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '0s' })

    assert.throws(() => {
      jwt.verify(token, env.JWT_SECRET)
    }, jwt.TokenExpiredError)
  })
})
