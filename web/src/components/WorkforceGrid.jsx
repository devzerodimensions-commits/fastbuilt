import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 15                // visible cells (5x3 desktop / 3x5 mobile)
const TICK = 1300           // ms between flips (one random photo each time)
const HALF = 470            // ms half-flip (swap image at this point)
const key = (x) => x?.id ?? x?.image
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const s = shuffle(pool)
  const out = []
  for (let i = 0; i < n; i++) out.push(s[i % s.length])
  return out
}

// Workforce hero — a RANDOM single photo (any row/column) flips at a time, then another.
// A shuffled queue feeds the photos so every one cycles through fairly (no permanent faces).
export default function WorkforceGrid() {
  const initRef = useRef(null)
  if (!initRef.current) initRef.current = pickDistinct(WORKFORCE_PHOTOS, N)
  const [cells, setCells] = useState(initRef.current)
  const [flip, setFlip] = useState(Array(N).fill(false))
  const poolRef = useRef(WORKFORCE_PHOTOS)
  const cellsRef = useRef(initRef.current)
  const queueRef = useRef([])

  useEffect(() => {
    let timer
    const timeouts = []
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // next photo from the shuffled queue that isn't already on screen
    const nextPhoto = () => {
      const shown = new Set(cellsRef.current.filter(Boolean).map(key))
      for (let g = 0; g < poolRef.current.length + 2; g++) {
        if (!queueRef.current.length) queueRef.current = shuffle(poolRef.current)
        const cand = queueRef.current.shift()
        if (cand && !shown.has(key(cand))) return cand
      }
      return null
    }

    const tick = () => {
      if (poolRef.current.length < 2) return
      const i = Math.floor(Math.random() * N)          // a random cell (any row/column)
      const next = nextPhoto()
      if (!next) return
      setFlip((f) => { const n = [...f]; n[i] = true; return n })       // flip out
      timeouts.push(setTimeout(() => {
        setCells((prev) => { const nc = [...prev]; nc[i] = next; cellsRef.current = nc; return nc })
        setFlip((f) => { const n = [...f]; n[i] = false; return n })    // flip back with new photo
      }, HALF))
    }

    const start = () => {
      if (!timer && !reduced && poolRef.current.length >= 2) {
        queueRef.current = shuffle(poolRef.current)
        timer = setInterval(tick, TICK)
      }
    }
    start()

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

    return () => { clearInterval(timer); timeouts.forEach(clearTimeout) }
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
