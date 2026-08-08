import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 15                // visible cells (5x3 desktop / 3x5 mobile)
const TICK = 2600           // ms between flips (one random column each time)
const HALF = 470            // ms half-flip (swap image at this point)
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)
const colsNow = () => (typeof window !== 'undefined' && window.innerWidth <= 760 ? 3 : 5)

function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const s = shuffle(pool)
  const out = []
  for (let i = 0; i < n; i++) out.push(s[i % s.length])
  return out
}

// Workforce hero — flips COLUMN BY COLUMN (left to right wave); a shuffled queue feeds
// the sets so every photo cycles through fairly.
export default function WorkforceGrid() {
  const initRef = useRef(null)
  if (!initRef.current) initRef.current = pickDistinct(WORKFORCE_PHOTOS, N)
  const [cells, setCells] = useState(initRef.current)
  const [flip, setFlip] = useState(Array(N).fill(false))
  const poolRef = useRef(WORKFORCE_PHOTOS)
  const queueRef = useRef([])

  useEffect(() => {
    let timer
    const timeouts = []
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const nextN = (count) => {
      const out = []
      for (let k = 0; k < count; k++) {
        if (!queueRef.current.length) queueRef.current = shuffle(poolRef.current)
        out.push(queueRef.current.shift() || null)
      }
      return out
    }

    const tick = () => {
      if (poolRef.current.length < 2) return
      const cols = colsNow()
      const col = Math.floor(Math.random() * cols)      // a random column each time
      const idxs = []
      for (let i = col; i < N; i += cols) idxs.push(i)
      const news = nextN(idxs.length)
      setFlip((f) => { const n = [...f]; idxs.forEach((i) => (n[i] = true)); return n })   // flip this column out
      timeouts.push(setTimeout(() => {
        setCells((prev) => { const nc = [...prev]; idxs.forEach((i, k) => (nc[i] = news[k])); return nc })
        setFlip((f) => { const n = [...f]; idxs.forEach((i) => (n[i] = false)); return n })  // flip back with new photos
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
