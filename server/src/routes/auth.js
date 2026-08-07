import { Router } from 'express'
import { signToken } from '../middleware/auth.js'

const router = Router()

const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'fastbuilt123'

// POST /api/auth/login  { username, password }
router.post('/login', (req, res) => {
  const { username, password } = req.body || {}
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ token: signToken({ user: username }), user: username })
  }
  return res.status(401).json({ error: 'Invalid username or password' })
})

// GET /api/auth/me — quick token check (used by the dashboard on load)
router.get('/me', (req, res) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' })
  res.json({ ok: true })
})

export default router
