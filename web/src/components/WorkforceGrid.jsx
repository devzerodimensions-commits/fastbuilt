import { useEffect, useRef, useState } from 'react'
import { fetchWorkers, imgWorker } from '../lib/workers'
import { WORKFORCE_PHOTOS } from '../lib/workforcePhotos'

const N = 9                 // visible cells (3x3)
const TICK = 3600           // ms between full crossfades
const FADE = 1200           // ms crossfade (matches the CSS whFadeIn)
const key = (x) => x?.id ?? x?.image
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5)

function pickDistinct(pool, n) {
  if (!pool || !pool.length) return Array(n).fill(null)
  const s = shuffle(pool)
  const out = []
  for (let i = 0; i < n; i++) out.push(s[i % s.length])
  return out
}

// Workforce hero — photos crossfade: a new photo eases IN over the old one (no blank).
// A shuffled queue feeds the photos so every one cycles through fairly.
export default function WorkforceGrid() {
  const initRef = useRef(null)
  if (!initRef.current) initRef.current = pickDistinct(WORKFORCE_PHOTOS, N)
  const [base, setBase] = useState(initRef.current)     // current photo per cell
  const [top, setTop] = useState(Array(N).fill(null))   // incoming photo per cell (fading in)
  const baseRef = useRef(initRef.current)
  const topRef = useRef(Array(N).fill(null))
  const poolRef = useRef(WORKFORCE_PHOTOS)
  const queueRef = useRef([])

  useEffect(() => {
    let timer
    const timeouts = []
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const tick = () => {
      if (poolRef.current.length < 2) return
      const ns = shuffle(poolRef.current).slice(0, N)      // N unique photos (all cells change together)
      setTop(() => { topRef.current = ns.slice(); return ns.slice() })   // all incoming fade in at once
      timeouts.push(setTimeout(() => {
        setBase(() => { baseRef.current = ns.slice(); return ns.slice() })
        setTop(() => { const n = Array(N).fill(null); topRef.current = n; return n })
      }, FADE))
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
      baseRef.current = startCells
      setBase(startCells)
      queueRef.current = shuffle(merged)
      start()
    })

    return () => { clearInterval(timer); timeouts.forEach(clearTimeout) }
  }, [])

  return (
    <div className="wh-grid">
      {base.map((b, i) => {
        const cur = top[i] || b
        return (
          <figure className="wh-card" key={i}>
            <div className="wh-img">
              {b && <img className="wh-base" src={imgWorker(b.image)} alt="" loading="lazy" />}
              {top[i] && <img className="wh-top" key={top[i].image} src={imgWorker(top[i].image)} alt="" />}
            </div>
            {cur?.name && (
              <figcaption className="wh-cap">
                <span className="wh-name">{cur.name}</span>
                {cur.role && <span className="wh-role">{cur.role}</span>}
              </figcaption>
            )}
          </figure>
        )
      })}
    </div>
  )
}
