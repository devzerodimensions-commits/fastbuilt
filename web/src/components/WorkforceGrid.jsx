import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 15                // visible cells (5x3 desktop / 3x5 mobile)
const TICK = 2800           // ms between full-grid flips
const HALF = 430            // ms half-flip (swap images at this point)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const s = shuffle(pool)
  const out = []
  for (let i = 0; i < n; i++) out.push(s[i % s.length])
  return out
}

// Workforce hero — ALL cells flip together to the next set of photos. A shuffled queue
// feeds the sets so every photo cycles through fairly (no permanent faces).
export default function WorkforceGrid() {
  const initRef = useRef(null)
  if (!initRef.current) initRef.current = pickDistinct(WORKFORCE_PHOTOS, N)
  const [cells, setCells] = useState(initRef.current)
  const [flipping, setFlipping] = useState(false)
  const poolRef = useRef(WORKFORCE_PHOTOS)
  const cellsRef = useRef(initRef.current)
  const queueRef = useRef([])

  useEffect(() => {
    let timer
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // next set of N photos, pulled from a shuffled queue of the whole pool (fair rotation)
    const nextSet = () => {
      const out = []
      for (let k = 0; k < N; k++) {
        if (!queueRef.current.length) queueRef.current = shuffle(poolRef.current)
        out.push(queueRef.current.shift() || null)
      }
      return out
    }

    const tick = () => {
      if (poolRef.current.length < 2) return
      setFlipping(true)                        // all cells flip out together
      setTimeout(() => {
        const ns = nextSet()
        cellsRef.current = ns
        setCells(ns)
        setFlipping(false)                     // all flip back in with new photos
      }, HALF)
    }

    const start = () => {
      if (!timer && !reduced && poolRef.current.length >= 2) {
        queueRef.current = shuffle(poolRef.current)
        timer = setInterval(tick, TICK)
      }
    }
    start()

    // merge real dashboard-added workers (Cloudinary URLs) with the bundled pool
    fetchWorkers().then((w) => {
      const db = Array.isArray(w) ? w.filter((x) => x && x.image && /^https?:\/\//.test(x.image)) : []
      const seen = new Set(WORKFORCE_PHOTOS.map((p) => p.image))
      const merged = [...WORKFORCE_PHOTOS, ...db.filter((x) => !seen.has(x.image))]
      poolRef.current = merged
      const startCells = pickDistinct(merged, N)
      cellsRef.current = startCells
      setCells(startCells)
      queueRef.current = shuffle(merged)
      start()
    })

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`wh-grid ${flipping ? 'flipping' : ''}`}>
      {cells.map((w, i) => (
        <figure className="wh-card" key={i}>
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
