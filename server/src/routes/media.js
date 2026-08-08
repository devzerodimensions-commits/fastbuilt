// Media library (WordPress-style). Administrators only.
import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { destroyCloudinary } from '../lib/cloudinary.js'

const router = Router()
router.use(requireAuth)   // any logged-in admin user (incl. editors) can manage media

// GET /api/media
router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM media ORDER BY created_at DESC, id DESC')
  res.json(rows)
})

// POST /api/media  (register an uploaded file)
router.post('/', async (req, res) => {
  const { url, public_id, filename, format, width, height, bytes, alt } = req.body || {}
  if (!url) return res.status(400).json({ error: 'url is required' })
  try {
    const { rows } = await pool.query(
      `INSERT INTO media (url, public_id, filename, format, width, height, bytes, alt)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [url, public_id || null, filename || null, format || null, width || null, height || null, bytes || null, alt || null]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    console.error('[media.create]', e.message)
    res.status(500).json({ error: 'Could not save media' })
  }
})

// PUT /api/media/:id  (after editing, or alt/filename change)
router.put('/:id', async (req, res) => {
  const { url, public_id, width, height, bytes, alt, filename } = req.body || {}
  const fields = [], vals = []; let i = 1
  const add = (col, v) => { if (v !== undefined) { fields.push(`${col}=$${i++}`); vals.push(v) } }
  add('url', url); add('public_id', public_id); add('width', width); add('height', height)
  add('bytes', bytes); add('alt', alt); add('filename', filename)
  if (!fields.length) return res.json({ ok: true })
  vals.push(req.params.id)
  try {
    const { rows } = await pool.query(`UPDATE media SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`, vals)
    if (!rows[0]) return res.status(404).json({ error: 'Media not found' })
    res.json(rows[0])
  } catch (e) {
    console.error('[media.update]', e.message)
    res.status(500).json({ error: 'Could not update media' })
  }
})

// DELETE /api/media/:id
router.delete('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT public_id FROM media WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Media not found' })
    if (rows[0].public_id) destroyCloudinary(rows[0].public_id).catch(() => {})
    await pool.query('DELETE FROM media WHERE id=$1', [req.params.id])
    res.json({ ok: true })
  } catch (e) {
    console.error('[media.delete]', e.message)
    res.status(500).json({ error: 'Could not delete media' })
  }
})

export default router
