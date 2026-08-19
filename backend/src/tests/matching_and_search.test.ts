import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// Jaccard similarity implementation matching matching.service.ts
function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0
  const setA = new Set(a.map((s) => s.toLowerCase()))
  const setB = new Set(b.map((s) => s.toLowerCase()))
  const intersection = [...setA].filter((x) => setB.has(x)).length
  const union = new Set([...setA, ...setB]).size
  return union === 0 ? 0 : intersection / union
}

function textOverlap(a = '', b = ''): number {
  const words = (s: string) => new Set(s.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  const wa = words(a), wb = words(b)
  if (!wa.size && !wb.size) return 0
  const intersection = [...wa].filter((w) => wb.has(w)).length
  return Math.min(1, intersection / Math.max(wa.size, wb.size))
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

describe('Phase 18 — Smart Matching & Search Security Algorithms', () => {
  describe('Jaccard Similarity', () => {
    it('should return 1.0 (100%) for identical skill sets', () => {
      const skillsA = ['TypeScript', 'React', 'Node.js']
      const skillsB = ['typescript', 'react', 'node.js']
      assert.equal(jaccard(skillsA, skillsB), 1.0)
    })

    it('should return 0.0 for completely disjoint skill sets', () => {
      const skillsA = ['Python', 'Django']
      const skillsB = ['Java', 'Spring']
      assert.equal(jaccard(skillsA, skillsB), 0.0)
    })

    it('should calculate partial overlap correctly', () => {
      const skillsA = ['React', 'TypeScript', 'Tailwind']
      const skillsB = ['React', 'Vue', 'Tailwind', 'Next.js']
      // Intersection: React, Tailwind (2)
      // Union: React, TypeScript, Tailwind, Vue, Next.js (5)
      // Jaccard = 2 / 5 = 0.4
      assert.equal(jaccard(skillsA, skillsB), 0.4)
    })

    it('should handle empty skill sets gracefully', () => {
      assert.equal(jaccard([], []), 0)
      assert.equal(jaccard(['React'], []), 0)
    })
  })

  describe('Text Overlap Scoring', () => {
    it('should compute overlap for shared keywords in goals', () => {
      const goalA = 'Prepare for software engineering internships and crack technical interviews'
      const goalB = 'Help students prepare for technical coding interviews and resume reviews'
      const score = textOverlap(goalA, goalB)
      assert.ok(score > 0)
    })

    it('should handle empty strings safely', () => {
      assert.equal(textOverlap('', ''), 0)
      assert.equal(textOverlap('hello', ''), 0)
    })
  })

  describe('Search Regex / ReDoS Sanitization', () => {
    it('should escape all regex special characters', () => {
      const dangerousInputs = [
        '.*+?^${}()|[]\\',
        '(a+)+$',
        'test.*(user|admin)',
        '[0-9]+',
      ]

      for (const input of dangerousInputs) {
        const escaped = escapeRegex(input)
        assert.doesNotThrow(() => {
          new RegExp(escaped, 'i')
        })
        // Ensure special chars are escaped
        assert.ok(escaped.includes('\\'))
      }
    })

    it('should preserve safe alpha-numeric search terms', () => {
      const term = 'John Doe Computer Science'
      assert.equal(escapeRegex(term), term)
    })
  })
})
