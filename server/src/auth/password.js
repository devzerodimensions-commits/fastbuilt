// Password hashing using Node's built-in crypto (scrypt) — no native/3rd-party dep.
import crypto from 'node:crypto'

// Returns "salt:hash" (both hex). scrypt is deliberately slow → resistant to brute force.
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(pw), salt, 64).toString('hex')
  return `${salt}:${hash}`
}

// Constant-time comparison of a plaintext password against a stored "salt:hash".
export function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const orig = Buffer.from(hash, 'hex')
  const test = crypto.scryptSync(String(pw), salt, 64)
  return orig.length === test.length && crypto.timingSafeEqual(orig, test)
}

// One-way hash for storing reset tokens (so a DB leak can't reuse them).
export const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex')
