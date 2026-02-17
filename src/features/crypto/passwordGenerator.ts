import type { GeneratorOptions } from '@/types'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'
const LOOKALIKES = /[0OIl1|]/g

const VOWELS = 'aeiou'
const CONSONANTS = 'bcdfghjklmnprstvwz'

function randomChar(charset: string): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  return charset[new DataView(bytes.buffer).getUint32(0) % charset.length]
}

function generatePronounceablePassword(length: number): string {
  let pwd = ''
  for (let i = 0; i < length; i++) {
    pwd += i % 2 === 0 ? randomChar(CONSONANTS) : randomChar(VOWELS)
  }
  return pwd
}

export function generatePassword(opts: GeneratorOptions): string {
  if (opts.pronounceable) return generatePronounceablePassword(opts.length)

  let charset = opts.customChars || ''
  if (!charset) {
    if (opts.uppercase) charset += UPPERCASE
    if (opts.lowercase) charset += LOWERCASE
    if (opts.digits) charset += DIGITS
    if (opts.symbols) charset += SYMBOLS
  }
  if (opts.excludeLookalikes && !opts.customChars) charset = charset.replace(LOOKALIKES, '')
  if (!charset) charset = LOWERCASE

  const bytes = new Uint8Array(opts.length * 3)
  crypto.getRandomValues(bytes)

  let pwd = ''
  for (let i = 0, b = 0; i < opts.length; i++, b++) {
    pwd += charset[bytes[b % bytes.length] % charset.length]
  }

  // Ensure required char types are present
  if (!opts.customChars) {
    const pwdArr = pwd.split('')
    const reqs: { src: string; active: boolean }[] = [
      { src: opts.excludeLookalikes ? UPPERCASE.replace(LOOKALIKES, '') : UPPERCASE, active: opts.uppercase },
      { src: opts.excludeLookalikes ? LOWERCASE.replace(LOOKALIKES, '') : LOWERCASE, active: opts.lowercase },
      { src: opts.excludeLookalikes ? DIGITS.replace(LOOKALIKES, '') : DIGITS, active: opts.digits },
      { src: SYMBOLS, active: opts.symbols },
    ]
    reqs.filter(r => r.active && r.src).forEach((r, i) => {
      const posBytes = new Uint8Array(4)
      crypto.getRandomValues(posBytes)
      const pos = new DataView(posBytes.buffer).getUint32(0) % opts.length
      pwdArr[pos] = randomChar(r.src)
    })
    return pwdArr.join('')
  }
  return pwd
}

export function estimateEntropy(password: string): number {
  let charset = 0
  if (/[A-Z]/.test(password)) charset += 26
  if (/[a-z]/.test(password)) charset += 26
  if (/[0-9]/.test(password)) charset += 10
  if (/[^A-Za-z0-9]/.test(password)) charset += 32
  if (!charset) return 0
  return Math.log2(Math.pow(charset, password.length))
}
