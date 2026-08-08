import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'

const N = 6                 // visible cells (3x2 desktop / 2x3 mobile)
const TICK = 1800           // ms between flips
const HALF = 340            // ms half-flip (swap image at this point)
const key = (x) => x?.id ?? x?.image

// pick n distinct random items from pool (pads by repeating if pool is small)
function pickDistinct(pool, n) {
  if (!pool.length) return Array(n).fill(null)
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  const out = []
  for (let i = 0; i < n; i++) out.push(shuffled[i % shuffled.length])
  return out
}

// The workforce hero: cells randomly flip through the whole photo pool, so no face is permanent.
export default function WorkforceGrid() {
  const [cells, setCells] = useState(Array(N).fill(null))
  const [flip, setFlip] = useState(Array(N).fill(false))
  const poolRef = useRef([])
  const cellsRef = useRef([])

  useEffect(() => {
    let timer
    const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    fetchWorkers().then((w) => {
      poolRef.current = w || []
      const start = pickDistinct(poolRef.current, N)
      cellsRef.current = start
      setCells(start)

      if (prefersReduced || poolRef.current.length < 2) return   // static if reduced-motion or too few images

      const tick = () => {
        const pool = poolRef.current
        const i = Math.floor(Math.random() * N)
        const shown = new Set(cellsRef.current.filter(Boolean).map(key))
        let candidates = pool.filter((p) => !shown.has(key(p)))
        if (!candidates.length) candidates = pool.filter((p) => key(p) !== key(cellsRef.current[i]))
        if (!candidates.length) return
        const next = candidates[Math.floor(Math.random() * candidates.length)]

        setFlip((f) => { const n = [...f]; n[i] = true; return n })      // flip out
        setTimeout(() => {
          const nc = [...cellsRef.current]; nc[i] = next; cellsRef.current = nc
          setCells(nc)
          setFlip((f) => { const n = [...f]; n[i] = false; return n })   // flip back in with new image
        }, HALF)
      }
      timer = setInterval(tick, TICK)
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
