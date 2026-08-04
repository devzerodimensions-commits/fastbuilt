import { useEffect, useRef, useState } from 'react'

// big.dk-style custom cursor: a small dot that follows with easing,
// grows on interactive elements and shows a "View" label over projects.
export default function CustomCursor() {
  const ref = useRef(null)
  const [mode, setMode] = useState('') // '' | 'link' | 'view'

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return // skip on touch

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const cur = { ...pos }
    let raf

    const onMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const project = e.target.closest?.('.prow')
      const link = e.target.closest?.('a, button')
      setMode(project ? 'view' : link ? 'link' : '')
    }

    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.2
      cur.y += (pos.y - cur.y) * 0.2
      if (ref.current) {
        ref.current.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(loop)
    document.body.classList.add('has-custom-cursor')
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-custom-cursor')
    }
  }, [])

  return (
    <div ref={ref} className={`cursor ${mode ? `cursor--${mode}` : ''}`} aria-hidden="true">
      {mode === 'view' && <span>View</span>}
    </div>
  )
}
