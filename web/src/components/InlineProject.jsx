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

// Name/heading stays FIXED on the left; the image + details scroll horizontally
// (left-click drag). The big image sits in the page centre.
export default function InlineProject({ project: p, onClose }) {
  const ref = useRef(null)
  const movedRef = useRef(false)

  // drag-to-scroll the strip (left button) — name column stays put
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

  // centre the first image on the page — computed ONCE (no per-frame reflow, so the grow stays buttery smooth)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const center = () => {
      const imgPanel = el.querySelector('.ph-image')
      if (!imgPanel) return
      const img = imgPanel.querySelector('img')
      let stripLeft = 0
      for (let n = el; n; n = n.offsetParent) stripLeft += n.offsetLeft
      // use the FINAL image width (natural aspect × final open height) so we don't
      // have to wait for / track the grow animation
      let finalW = imgPanel.offsetWidth
      if (img && img.naturalWidth) {
        finalW = (window.innerHeight * 0.56) * (img.naturalWidth / img.naturalHeight)
      }
      imgPanel.style.marginLeft = Math.max(0, window.innerWidth / 2 - finalW / 2 - stripLeft) + 'px'
      el.scrollLeft = 0
    }
    const img = el.querySelector('.ph-image img')
    if (img && img.complete) center()
    else if (img) img.addEventListener('load', center)
    const t = setTimeout(center, 50)   // safety
    window.addEventListener('resize', center)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', center)
      if (img) img.removeEventListener('load', center)
    }
  }, [])

  const guard = (e) => { if (movedRef.current) { e.preventDefault(); e.stopPropagation() } }

  return (
    <div className="pinline">
      {/* FIXED name column (does not scroll) */}
      <div className="pinline-name-col" onClick={() => onClose && onClose()} title="Click to close">
        <CategoryIcon category={p.category} />
        <h2>{p.name}</h2>
        <span className="ph-loc">{p.location}</span>
      </div>

      {/* horizontal scroll strip: image + details */}
      <div className="pinline-scroll" ref={ref} onClickCapture={guard}>
        <section className="ph-panel ph-image">
          <img src={imgColor(p.image)} alt={p.name} draggable="false" />
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
        <section className="ph-panel ph-image">
          <img src={imgColor(p.image2 || p.image)} alt={p.name} draggable="false" />
        </section>
      </div>
    </div>
  )
}
