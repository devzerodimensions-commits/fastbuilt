import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'change-me-in-env'

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' })
}

// Protect write routes — require a valid Bearer token.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'unauthorized' })
  try {
    req.admin = jwt.verify(token, SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'invalid token' })
  }
}
