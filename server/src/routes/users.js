// WordPress-style Users management. Administrators only.
import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'
import { hashPassword } from '../auth/password.js'

const router = Router()
router.use(requireAdmin)

const PUBLIC = 'id, username, email, role, name, created_at'

// GET /api/users
router.get('/', async (_req, res) => {
  const { rows } = await pool.query(`SELECT ${PUBLIC} FROM admins ORDER BY id`)
  res.json(rows)
})

// POST /api/users  { username, email, password, role, name }
router.post('/', async (req, res) => {
  const { username, email, password, role, name } = req.body || {}
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' })
  if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO admins (username, email, password_hash, role, name) VALUES ($1,$2,$3,$4,$5) RETURNING ${PUBLIC}`,
      [String(username).trim(), email || null, hashPassword(password), role || 'editor', name || null]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(400).json({ error: 'That username already exists' })
    console.error('[users.create]', e.message)
    res.status(500).json({ error: 'Could not create user' })
  }
})

// PUT /api/users/:id  { email?, password?, role?, name? }  (username is immutable)
router.put('/:id', async (req, res) => {
  const { email, password, role, name } = req.body || {}
  const fields = [], vals = []; let i = 1
  if (email !== undefined) { fields.push(`email=$${i++}`); vals.push(email || null) }
  if (role !== undefined) { fields.push(`role=$${i++}`); vals.push(role) }
  if (name !== undefined) { fields.push(`name=$${i++}`); vals.push(name || null) }
  if (password) { fields.push(`password_hash=$${i++}`); vals.push(hashPassword(password)) }
  if (!fields.length) return res.json({ ok: true })
  vals.push(req.params.id)
  try {
    const { rows } = await pool.query(`UPDATE admins SET ${fields.join(', ')} WHERE id=$${i} RETURNING ${PUBLIC}`, vals)
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (e) {
    console.error('[users.update]', e.message)
    res.status(500).json({ error: 'Could not update user' })
  }
})

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT username, role FROM admins WHERE id=$1', [req.params.id])
    const target = rows[0]
    if (!target) return res.status(404).json({ error: 'User not found' })
    if (target.username.toLowerCase() === String(req.admin.user).toLowerCase())
      return res.status(400).json({ error: "You can't delete your own account" })
    if (target.role === 'administrator') {
      const c = await pool.query("SELECT COUNT(*)::int AS n FROM admins WHERE role='administrator'")
      if (c.rows[0].n <= 1) return res.status(400).json({ error: "Can't delete the last administrator" })
    }
    await pool.query('DELETE FROM admins WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[users.delete]', e.message)
    res.status(500).json({ error: 'Could not delete user' })
  }
})

export default router
