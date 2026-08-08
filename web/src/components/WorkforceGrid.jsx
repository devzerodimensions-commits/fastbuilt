import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 15                // visible cells (5x3 desktop / 3x5 mobile)
const TICK = 2100           // ms between flip batches
const HALF = 470            // ms half-flip (swap image at this point)
const BATCH_MIN = 3, BATCH_MAX = 5   // how many random photos flip together each time
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
      const k = BATCH_MIN + Math.floor(Math.random() * (BATCH_MAX - BATCH_MIN + 1))   // 3..5 photos
      const idxs = shuffle([...Array(N).keys()]).slice(0, k)                          // random cells (any row/col)
      const news = idxs.map(() => nextPhoto())
      setFlip((f) => { const n = [...f]; idxs.forEach((i) => (n[i] = true)); return n })   // flip out together
      timeouts.push(setTimeout(() => {
        setCells((prev) => {
          const nc = [...prev]
          idxs.forEach((i, j) => { if (news[j]) nc[i] = news[j] })
          cellsRef.current = nc
          return nc
        })
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
            {w && <img src={imgWorker(w.image)} alt="" loading="lazy" />}
          </div>
        </figure>
      ))}
    </div>
  )
}
