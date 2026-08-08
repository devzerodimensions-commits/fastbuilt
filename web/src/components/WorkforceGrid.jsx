import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 15                // visible cells (5x3 desktop / 3x5 mobile)
const TICK = 1800           // ms between flips
const HALF = 340            // ms half-flip (swap image at this point)
const key = (x) => x?.id ?? x?.image
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const s = shuffle(pool)
  const out = []
  for (let i = 0; i < n; i++) out.push(s[i % s.length])
  return out
}

// The workforce hero. A shuffled QUEUE of the whole pool feeds the flips, so every
// photo is shown in turn (fair rotation) before any repeats — as the pool grows,
// all faces cycle through.
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
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    // (re)build the queue = every photo not currently on screen, shuffled
    const refill = () => {
      const shown = new Set(cellsRef.current.filter(Boolean).map(key))
      let q = shuffle(poolRef.current.filter((p) => !shown.has(key(p))))
      if (!q.length) q = shuffle(poolRef.current)   // pool <= N: allow repeats
      queueRef.current = q
    }

    const nextPhoto = () => {
      const shown = new Set(cellsRef.current.filter(Boolean).map(key))
      // take from the queue the next photo that isn't already visible
      for (let guard = 0; guard < poolRef.current.length + 2; guard++) {
        if (!queueRef.current.length) refill()
        const cand = queueRef.current.shift()
        if (cand && !shown.has(key(cand))) return cand
      }
      return null
    }

    const tick = () => {
      if (poolRef.current.length < 2) return
      const next = nextPhoto()
      if (!next) return
      const i = Math.floor(Math.random() * N)       // random cell (natural look)
      setFlip((f) => { const n = [...f]; n[i] = true; return n })
      setTimeout(() => {
        const nc = [...cellsRef.current]; nc[i] = next; cellsRef.current = nc
        setCells(nc)
        setFlip((f) => { const n = [...f]; n[i] = false; return n })
      }, HALF)
    }

    const start = () => { if (!timer && !reduced && poolRef.current.length >= 2) { refill(); timer = setInterval(tick, TICK) } }
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
      refill()
      start()
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
