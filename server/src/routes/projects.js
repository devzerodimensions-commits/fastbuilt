import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const FIELDS = ['name', 'category', 'location', 'client', 'year', 'status', 'contract_type', 'team', 'summary', 'image', 'image2', 'sort_order']

// GET /api/projects  (optional ?cat=Civil) — public
router.get('/', async (req, res, next) => {
  try {
    const { cat } = req.query
    const sql = cat
      ? 'SELECT * FROM projects WHERE category = $1 ORDER BY sort_order, id'
      : 'SELECT * FROM projects ORDER BY sort_order, id'
    const { rows } = await query(sql, cat ? [cat] : [])
    res.json(rows)
  } catch (e) { next(e) }
})

// GET /api/projects/:slug — public
router.get('/:slug', async (req, res, next) => {
  try {
    const { rows } = await query('SELECT * FROM projects WHERE slug = $1', [req.params.slug])
    if (!rows.length) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (e) { next(e) }
})

// POST /api/projects — create (protected)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    if (!b.name || !b.category) return res.status(400).json({ error: 'name and category are required' })
    const slug = b.slug ? slugify(b.slug) : slugify(b.name)
    const { rows } = await query(
      `INSERT INTO projects (slug, name, category, location, client, year, status, contract_type, team, summary, image, image2, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [slug, b.name, b.category, b.location, b.client, b.year, b.status, b.contract_type, b.team, b.summary, b.image, b.image2, b.sort_order || 0]
    )
    res.status(201).json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'A project with this slug already exists' })
    next(e)
  }
})

// PUT /api/projects/:id — update (protected)
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const b = req.body || {}
    const sets = []
    const vals = []
    let i = 1
    for (const f of FIELDS) {
      if (b[f] !== undefined) { sets.push(`${f} = $${i++}`); vals.push(b[f]) }
    }
    if (b.slug !== undefined) { sets.push(`slug = $${i++}`); vals.push(slugify(b.slug)) }
    if (!sets.length) return res.status(400).json({ error: 'nothing to update' })
    vals.push(req.params.id)
    const { rows } = await query(`UPDATE projects SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals)
    if (!rows.length) return res.status(404).json({ error: 'not found' })
    res.json(rows[0])
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'A project with this slug already exists' })
    next(e)
  }
})

// DELETE /api/projects/:id — delete (protected)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await query('DELETE FROM projects WHERE id = $1', [req.params.id])
    if (!rowCount) return res.status(404).json({ error: 'not found' })
    res.json({ ok: true })
  } catch (e) { next(e) }
})

export default router
