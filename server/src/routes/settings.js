// Site settings (key/value). Public GET (so the site can read contact info);
// administrators only for updates.
import { Router } from 'express'
import { pool } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// GET /api/settings -> { key: value, ... }
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT key, value FROM settings')
    const obj = {}
    rows.forEach((r) => { obj[r.key] = r.value })
    res.json(obj)
  } catch {
    res.json({})
  }
})

// PUT /api/settings  { key: value, ... }  (admin)
router.put('/', requireAdmin, async (req, res) => {
  const body = req.body || {}
  try {
    for (const [k, v] of Object.entries(body)) {
      await pool.query(
        'INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value=$2',
        [k, v == null ? null : String(v)]
      )
    }
    res.json({ ok: true })
  } catch (e) {
    console.error('[settings.update]', e.message)
    res.status(500).json({ error: 'Could not save settings' })
  }
})

export default router
