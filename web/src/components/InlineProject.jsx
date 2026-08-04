import { useEffect, useRef } from 'react'
import CategoryIcon from './CategoryIcon'
import { imgColor } from '../lib/projects'

const SPEC_FIELDS = [
  ['Project Location', 'location'],
  ['Client', 'client'],
  ['Year Completed', 'year'],
  ['Project Status', 'status'],
  ['Contract Type', 'contract_type'],
  ['Team', 'team'],
]

// Name/heading fixed on the left; the image is CSS-centred (flex) so it grows in
// place at the centre — no left-shift/drift. Drag to scroll the info sideways.
export default function InlineProject({ project: p, onClose }) {
  const ref = useRef(null)
  const movedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let down = false, startX = 0, startLeft = 0
    const onDown = (e) => {
      if (e.button !== 0) return
      down = true; movedRef.current = false
      startX = e.clientX; startLeft = el.scrollLeft
      el.classList.add('dragging')
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) movedRef.current = true
      el.scrollLeft = startLeft - dx
    }
    const onUp = () => { down = false; el.classList.remove('dragging'); setTimeout(() => { movedRef.current = false }, 0) }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const guard = (e) => { if (movedRef.current) { e.preventDefault(); e.stopPropagation() } }

  return (
    <div className="pinline">
      {/* fixed name column (absolute on desktop, on top on mobile) */}
      <div className="pinline-name-col" onClick={() => onClose && onClose()} title="Click to close">
        <CategoryIcon category={p.category} />
        <h2>{p.name}</h2>
        <span className="ph-loc">{p.location}</span>
      </div>

      <div className="pinline-scroll" ref={ref} onClickCapture={guard}>
        {/* hero slide = full width, image centred on the page */}
        <section className="ph-panel ph-hero">
          <img src={imgColor(p.image)} alt={p.name} draggable="false" decoding="async" />
        </section>
        <section className="ph-panel ph-intro">
          <span className="pinline-cat">Overview</span>
          <p>{p.summary}</p>
        </section>
        <section className="ph-panel ph-specs">
          <div className="pinline-specs">
            {SPEC_FIELDS.map(([label, key]) => (
              <div className="spec" key={key}>
                <label>{label}</label>
                <div className="v">{p[key] || '—'}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="ph-panel ph-hero">
          <img src={imgColor(p.image2 || p.image)} alt={p.name} draggable="false" decoding="async" />
        </section>
      </div>
    </div>
  )
}
