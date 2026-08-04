import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

// GET /api/projects  (optional ?cat=Civil)
router.get('/', async (req, res) => {
  const { cat } = req.query
  const sql = cat
    ? 'SELECT * FROM projects WHERE category = $1 ORDER BY sort_order, id'
    : 'SELECT * FROM projects ORDER BY sort_order, id'
  const { rows } = await query(sql, cat ? [cat] : [])
  res.json(rows)
})

// GET /api/projects/:slug
router.get('/:slug', async (req, res) => {
  const { rows } = await query('SELECT * FROM projects WHERE slug = $1', [req.params.slug])
  if (!rows.length) return res.status(404).json({ error: 'not found' })
  res.json(rows[0])
})

export default router
