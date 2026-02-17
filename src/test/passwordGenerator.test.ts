import { describe, it, expect } from 'vitest'
import { generatePassword, estimateEntropy } from '@/features/crypto/passwordGenerator'

const base = { length: 20, uppercase: true, lowercase: true, digits: true, symbols: false, excludeLookalikes: false, pronounceable: false, customChars: '' }

describe('generatePassword', () => {
  it('generates a password of the requested length', () => {
    expect(generatePassword(base)).toHaveLength(20)
  })
  it('includes only lowercase when configured', () => {
    const pwd = generatePassword({ ...base, uppercase: false, digits: false, length: 30 })
    expect(pwd).toMatch(/^[a-z]+$/)
  })
  it('generates pronounceable passwords', () => {
    expect(generatePassword({ ...base, pronounceable: true, length: 12 })).toHaveLength(12)
  })
  it('excludes lookalike characters', () => {
    for (let i = 0; i < 10; i++) {
      const pwd = generatePassword({ ...base, uppercase: true, digits: true, excludeLookalikes: true, length: 50 })
      expect(pwd).not.toMatch(/[0OIl1|]/)
    }
  })
  it('generates different passwords each time', () => {
    expect(generatePassword(base)).not.toBe(generatePassword(base))
  })
})

describe('estimateEntropy', () => {
  it('returns higher entropy for longer passwords', () => {
    expect(estimateEntropy('abcdefghijklmnop')).toBeGreaterThan(estimateEntropy('abc'))
  })
  it('returns higher entropy for mixed character types', () => {
    expect(estimateEntropy('aA1!aA1!aA')).toBeGreaterThan(estimateEntropy('aaaaaaaaaa'))
  })
  it('returns 0 for empty string', () => {
    expect(estimateEntropy('')).toBe(0)
  })
})
