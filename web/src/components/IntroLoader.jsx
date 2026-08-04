import { useEffect, useRef, useState } from 'react'

// big.dk-style intro: logo appears centred on a black screen, then flies to the
// top-left (into the navbar) while the black screen wipes upward to reveal the site.
// Plays once per browser session.
export default function IntroLoader() {
  const [show, setShow] = useState(() => {
    try { return !sessionStorage.getItem('fb_intro') } catch { return true }
  })
  const [phase, setPhase] = useState('in')   // 'in' -> 'move'
  const logoRef = useRef(null)

  useEffect(() => {
    if (!show) return
    document.body.style.overflow = 'hidden'
    const el = logoRef.current

    const centre = () => {
      if (!el) return
      const w = el.offsetWidth, h = el.offsetHeight
      el.style.transform = `translate(${(window.innerWidth - w) / 2}px, ${(window.innerHeight - h) / 2}px) scale(1)`
    }
    centre()

    // move logo into the navbar + wipe the black screen up
    const t1 = setTimeout(() => {
      const target = document.querySelector('.brand-logo')?.getBoundingClientRect()
      if (el && target) {
        const s = target.height / el.offsetHeight
        el.style.transform = `translate(${target.left}px, ${target.top}px) scale(${s})`
      }
      setPhase('move')
    }, 1050)

    const t2 = setTimeout(() => {
      try { sessionStorage.setItem('fb_intro', '1') } catch {}
      document.body.style.overflow = ''
      setShow(false)
    }, 2050)

    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [show])

  if (!show) return null
  return (
    <div className="intro" aria-hidden="true">
      <div className={`intro-bg ${phase}`} />
      <img ref={logoRef} className={`intro-logo ${phase}`} src="/logo.png" alt="" />
    </div>
  )
}
