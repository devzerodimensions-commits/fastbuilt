import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// list — public
router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM categories ORDER BY sort_order, id')
    res.json(rows)
  } catch (e) { next(e) }
})

// create — protected
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name) return res.status(400).json({ error: 'name is required' })
    const { rows } = await query('INSERT INTO categories (name, sort_order) VALUES ($1,$2) RETURNING *', [b.name, b.sort_order || 0])
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That category already exists' })
    next(e)
  }
})

// update — protected
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    const sets = []; const vals = []; let i = 1
    if (b.name !== undefined) { sets.push(`name = $${i++}`); vals.push(b.name) }
    if (b.sort_order !== undefined) { sets.push(`sort_order = $${i++}`); vals.push(b.sort_order) }
    if (!sets.length) return res.status(400).json({ error: 'nothing to update' })
    vals.push(req.params.id)
    const { rows } = await query(`UPDATE categories SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals)
    if (!rows.length) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'That category already exists' })
    next(e)
  }
})

// delete — protected
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM categories WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
