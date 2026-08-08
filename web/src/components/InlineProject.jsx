import { useEffect, useLayoutEffect, useRef } from 'react'
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
export default function InlineProject({ project: p, flipFrom, onClose }) {
  const ref = useRef(null)
  const movedRef = useRef(false)

  // FLIP: morph the SAME image from the clicked thumbnail's rect -> its open rect
  // (grows in place, no swap/pause) and colourise B&W -> colour during the move.
  // PAGE-centre the first image so it lines up with the closed thumbnails above/below.
  // The closed thumbnails sit in the dead-centre grid column of .projects, so "centre"
  // means the .projects horizontal centre (== screen centre; the scale origin is 50%).
  // Measure ONLY in unscaled layout space (offsetLeft/clientWidth/clientHeight ignore the
  // scroll-shrink transform) and size the image so it always fits page-centred.
  const centreImage = () => {
    const el = ref.current                                   // .pinline-scroll
    if (!el) return
    const heroPanel = el.querySelector('.ph-hero')
    const img = heroPanel && heroPanel.querySelector('img')
    if (!heroPanel || !img) return
    heroPanel.style.marginLeft = '0px'
    el.scrollLeft = 0
    const col = el.closest('.projects') || el.offsetParent
    if (!col) return
    const absLeft = (n) => { let x = 0; for (let m = n; m; m = m.offsetParent) x += m.offsetLeft; return x }
    const scrollLeft = absLeft(el) - absLeft(col)            // scroll strip's left within the column
    const pageCentre = col.clientWidth / 2                   // == screen centre
    // half-width available for a page-centred image (can't spill past the strip's edges)
    const maxHalf = Math.max(0, Math.min(pageCentre - scrollLeft, scrollLeft + el.clientWidth - pageCentre))
    // target size 800 x 480; scale DOWN proportionally on smaller screens so it always
    // fits page-centred (object-fit: cover keeps the photo undistorted)
    const BASE_W = 800, BASE_H = 480
    const scale = Math.min(1, (maxHalf * 2) / BASE_W, el.clientHeight / BASE_H)
    const w = BASE_W * scale, h = BASE_H * scale
    // give EVERY image in the open view the SAME size (1st, 2nd and any future images)
    el.querySelectorAll('.ph-hero img').forEach((im) => {
      im.style.width = w + 'px'
      im.style.height = h + 'px'
      im.style.objectFit = 'cover'
    })
    const imgLeft = absLeft(img) - absLeft(col)              // image left within the column (margin still 0)
    heroPanel.style.marginLeft = Math.max(0, pageCentre - w / 2 - imgLeft) + 'px'
  }

  // FLIP: page-centre the image, then morph the SAME image from the thumbnail rect
  // to that centred position (grows in place) + colourise B&W -> colour.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const img = el.querySelector('.ph-hero img')
    if (!img) return
    img.style.transform = 'none'
    centreImage()                                  // sets margin-left so image is page-centred
    const last = img.getBoundingClientRect()       // centred open rect
    let fromTransform = 'none'
    if (flipFrom && last.width) {
      const dx = flipFrom.left - last.left
      const dy = flipFrom.top - last.top
      const sx = flipFrom.width / last.width
      const sy = flipFrom.height / last.height
      fromTransform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
    }
    img.style.transformOrigin = 'top left'
    const anim = img.animate(
      [
        { transform: fromTransform, filter: 'grayscale(1)' },
        { transform: 'none', filter: 'grayscale(0)' },
      ],
      { duration: 1500, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' }
    )
    window.addEventListener('resize', centreImage)
    // if the image wasn't decoded yet (offsetWidth 0), re-centre once it loads
    const onImgLoad = () => centreImage()
    if (!img.complete || !img.naturalWidth) img.addEventListener('load', onImgLoad)
    return () => {
      try { anim.cancel() } catch {}
      window.removeEventListener('resize', centreImage)
      img.removeEventListener('load', onImgLoad)
    }
  }, [flipFrom])

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
