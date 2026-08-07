import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

// CRUD router for a simple people table (workers / team): name, role, image, sort_order
export default function peopleCrud(table) {
  const router = Router()
  const FIELDS = ['name', 'role', 'image', 'sort_order']

  // list — public
  router.get('/', async (_req, res, next) => {
    try {
      const { rows } = await query(`SELECT * FROM ${table} ORDER BY sort_order, id`)
      res.json(rows)
    } catch (e) { next(e) }
  })

  // create — protected
  router.post('/', requireAuth, async (req, res, next) => {
    try {
      const b = req.body || {}
      if (!b.name) return res.status(400).json({ error: 'name is required' })
      const { rows } = await query(
        `INSERT INTO ${table} (name, role, image, sort_order) VALUES ($1,$2,$3,$4) RETURNING *`,
        [b.name, b.role, b.image, b.sort_order || 0]
      )
      res.status(201).json(rows[0])
    } catch (e) { next(e) }
  })

  // update — protected
  router.put('/:id', requireAuth, async (req, res, next) => {
    try {
      const b = req.body || {}
      const sets = []; const vals = []; let i = 1
      for (const f of FIELDS) if (b[f] !== undefined) { sets.push(`${f} = $${i++}`); vals.push(b[f]) }
      if (!sets.length) return res.status(400).json({ error: 'nothing to update' })
      vals.push(req.params.id)
      const { rows } = await query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, vals)
      if (!rows.length) return res.status(404).json({ error: 'not found' })
      res.json(rows[0])
    } catch (e) { next(e) }
  })

  // delete — protected
  router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const { rowCount } = await query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id])
      if (!rowCount) return res.status(404).json({ error: 'not found' })
      res.json({ ok: true })
    } catch (e) { next(e) }
  })

  return router
}
