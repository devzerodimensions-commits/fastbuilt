import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 10                // visible cells (5x2 desktop / 2x5 mobile)
const TICK = 1800           // ms between flips
const HALF = 340            // ms half-flip (swap image at this point)
const key = (x) => x?.id ?? x?.image

// pick n distinct random items from pool (pads by repeating if pool is small)
function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const out = []
  for (let i = 0; i < n; i++) out.push(shuffled[i % shuffled.length])
  return out
}

// The workforce hero: cells randomly flip through the whole photo pool, so no face is
// permanent. Renders instantly with bundled photos, then swaps to the live pool.
export default function WorkforceGrid() {
  const initRef = useRef(null)
  if (!initRef.current) initRef.current = pickDistinct(WORKFORCE_PHOTOS, N)
  const [cells, setCells] = useState(initRef.current)
  const [flip, setFlip] = useState(Array(N).fill(false))
  const poolRef = useRef(WORKFORCE_PHOTOS)
  const cellsRef = useRef(initRef.current)

  useEffect(() => {
    let timer
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      const pool = poolRef.current
      if (pool.length < 2) return
      const i = Math.floor(Math.random() * N)
      const shown = new Set(cellsRef.current.filter(Boolean).map(key))
      let candidates = pool.filter((p) => !shown.has(key(p)))
      if (!candidates.length) candidates = pool.filter((p) => key(p) !== key(cellsRef.current[i]))
      if (!candidates.length) return
      const next = candidates[Math.floor(Math.random() * candidates.length)]
      setFlip((f) => { const n = [...f]; n[i] = true; return n })          // flip out
      setTimeout(() => {
        const nc = [...cellsRef.current]; nc[i] = next; cellsRef.current = nc
        setCells(nc)
        setFlip((f) => { const n = [...f]; n[i] = false; return n })       // flip back with new image
      }, HALF)
    }

    if (!reduced && poolRef.current.length >= 2) timer = setInterval(tick, TICK)

    // merge in real dashboard-added workers (Cloudinary URLs) — skip legacy sample keys
    fetchWorkers().then((w) => {
      const db = Array.isArray(w) ? w.filter((x) => x && x.image && /^https?:\/\//.test(x.image)) : []
      const seen = new Set(WORKFORCE_PHOTOS.map((p) => p.image))
      const merged = [...WORKFORCE_PHOTOS, ...db.filter((x) => !seen.has(x.image))]
      poolRef.current = merged
      const start = pickDistinct(merged, N)
      cellsRef.current = start
      setCells(start)
      if (!timer && !reduced && merged.length >= 2) timer = setInterval(tick, TICK)
    })

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="wh-grid">
      {cells.map((w, i) => (
        <figure className={`wh-card ${flip[i] ? 'flip' : ''}`} key={i}>
          <div className="wh-img">
            {w && <img src={imgWorker(w.image)} alt={w.name || ''} loading="lazy" />}
          </div>
          <figcaption className="wh-cap">
            <span className="wh-name">{w?.name}</span>
            <span className="wh-role">{w?.role}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
