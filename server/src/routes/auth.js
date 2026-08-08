import { Router } from 'express'
import crypto from 'node:crypto'
import { pool } from '../db.js'
import { signToken } from '../middleware/auth.js'
import { hashPassword, verifyPassword, sha256 } from '../auth/password.js'
import { sendResetEmail, mailerReady } from '../auth/mailer.js'

const router = Router()

// env credentials are only a fallback for the very first boot / DB hiccup —
// normally the account lives in the `admins` table (see bootstrap.js).
const ADMIN_USER = process.env.ADMIN_USER || 'admin'
const ADMIN_PASS = process.env.ADMIN_PASS || 'fastbuilt123'

async function findAdmin(identifier) {
  const { rows } = await pool.query(
    'SELECT * FROM admins WHERE lower(username)=lower($1) OR lower(email)=lower($1) LIMIT 1',
    [identifier]
  )
  return rows[0] || null
}

// POST /api/auth/login  { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Missing username or password' })
  try {
    const { rows } = await pool.query('SELECT * FROM admins WHERE lower(username)=lower($1) LIMIT 1', [username])
    const row = rows[0]
    if (row) {
      if (verifyPassword(password, row.password_hash))
        return res.json({ token: signToken({ user: row.username }), user: row.username })
      return res.status(401).json({ error: 'Invalid username or password' })
    }
  } catch {
    // admins table may not exist yet on a fresh DB — fall through to env credentials
  }
  if (username === ADMIN_USER && password === ADMIN_PASS)
    return res.json({ token: signToken({ user: username }), user: username })
  return res.status(401).json({ error: 'Invalid username or password' })
})

// GET /api/auth/me — quick token check (used by the dashboard on load)
router.get('/me', (req, res) => {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' })
  res.json({ ok: true })
})

// GET /api/auth/config — tells the frontend whether email-based reset is available
router.get('/config', (_req, res) => res.json({ emailReset: mailerReady() }))

// POST /api/auth/forgot  { identifier }  — WordPress-style "Lost your password?"
// Always responds success (never reveals whether the account/email exists).
router.post('/forgot', async (req, res) => {
  const { identifier } = req.body || {}
  const generic = { ok: true, message: 'If that account exists, a password reset link has been emailed to it.' }
  if (!identifier) return res.json(generic)
  try {
    const admin = await findAdmin(String(identifier).trim())
    if (!admin) return res.json(generic)
    if (!admin.email) {
      console.warn('[forgot] admin has no recovery email — set ADMIN_EMAIL')
      return res.json(generic)
    }
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // valid 1 hour
    await pool.query('UPDATE admins SET reset_token=$1, reset_expires=$2 WHERE id=$3', [sha256(token), expires, admin.id])

    const base = (process.env.APP_URL || req.headers.origin || req.headers.referer || '').replace(/\/+$/, '')
    const link = `${base}/admin/reset?token=${token}`
    await sendResetEmail(admin.email, link)
    return res.json(generic)
  } catch (e) {
    console.error('[forgot]', e.message)
    return res.json(generic) // never leak details
  }
})

// POST /api/auth/reset  { token, password }
router.post('/reset', async (req, res) => {
  const { token, password } = req.body || {}
  if (!token || !password) return res.status(400).json({ error: 'Missing token or password' })
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  try {
    const { rows } = await pool.query(
      'SELECT * FROM admins WHERE reset_token=$1 AND reset_expires > now() LIMIT 1',
      [sha256(token)]
    )
    const admin = rows[0]
    if (!admin) return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
    await pool.query(
      'UPDATE admins SET password_hash=$1, reset_token=NULL, reset_expires=NULL WHERE id=$2',
      [hashPassword(password), admin.id]
    )
    return res.json({ ok: true })
  } catch (e) {
    console.error('[reset]', e.message)
    return res.status(500).json({ error: 'Could not reset password. Please try again.' })
  }
})

export default router
