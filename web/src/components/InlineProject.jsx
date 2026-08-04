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

// Horizontal strip that starts at the HEADING (name). The big image sits in
// the page centre. Left-click + drag moves everything sideways, starting from
// the heading.
export default function InlineProject({ project: p, onClose }) {
  const ref = useRef(null)
  const movedRef = useRef(false)

  // drag-to-scroll (left button)
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

  // put the big image in the page centre (heading stays to its left)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const center = () => {
      const nameEl = el.querySelector('.ph-name')
      const imgPanel = el.querySelector('.ph-image')
      if (!nameEl || !imgPanel) return
      imgPanel.style.marginLeft = '0px'
      let stripLeft = 0
      for (let n = el; n; n = n.offsetParent) stripLeft += n.offsetLeft
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0
      const imgStartNoMargin = stripLeft + nameEl.offsetWidth + gap
      const desiredImgLeft = window.innerWidth / 2 - imgPanel.offsetWidth / 2
      const m = Math.max(0, desiredImgLeft - imgStartNoMargin)
      imgPanel.style.marginLeft = m + 'px'
      el.scrollLeft = 0
    }
    const t = setTimeout(center, 130)
    window.addEventListener('resize', center)
    const img = el.querySelector('.ph-image img')
    if (img && !img.complete) img.addEventListener('load', center)
    return () => {
      clearTimeout(t)
      window.removeEventListener('resize', center)
      if (img) img.removeEventListener('load', center)
    }
  }, [])

  const guard = (e) => { if (movedRef.current) { e.preventDefault(); e.stopPropagation() } }

  return (
    <div className="pinline">
      <div className="pinline-scroll" ref={ref} onClickCapture={guard}>
        <section
          className="ph-panel ph-name"
          onClick={() => !movedRef.current && onClose && onClose()}
          title="Click to close"
        >
          <CategoryIcon category={p.category} />
          <h2>{p.name}</h2>
          <span className="ph-loc">{p.location}</span>
        </section>

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
