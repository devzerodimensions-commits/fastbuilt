import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// big.dk-style intro: logo shows CENTRED on a black screen first, then flies to the
// top-left (into the navbar) while the black screen wipes upward to reveal the site.
export default function IntroLoader() {
  const [show, setShow] = useState(true)     // plays on every page load
  const [phase, setPhase] = useState('in')   // 'in' -> 'move'
  const logoRef = useRef(null)

  // place the logo at the centre INSTANTLY (no transition) so it appears centred first
  useLayoutEffect(() => {
    const el = logoRef.current
    if (!el) return
    el.style.transition = 'none'
    const w = el.offsetWidth, h = el.offsetHeight
    el.style.transform = `translate(${(window.innerWidth - w) / 2}px, ${(window.innerHeight - h) / 2}px)`
    el.getBoundingClientRect()   // commit the centred position before any transition
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const el = logoRef.current

    // after a beat: enable the transition and fly the logo into the navbar + wipe bg up
    const t1 = setTimeout(() => {
      if (el) {
        el.style.transition = 'transform 1.3s cubic-bezier(.76,0,.24,1), filter .8s ease'
        const target = document.querySelector('.brand-logo')?.getBoundingClientRect()
        if (target && el.offsetHeight) {
          const s = target.height / el.offsetHeight
          el.style.transform = `translate(${target.left}px, ${target.top}px) scale(${s})`
        }
      }
      setPhase('move')
    }, 1700)

    const t2 = setTimeout(() => {
      document.body.style.overflow = ''
      setShow(false)
    }, 3100)

    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])

  if (!show) return null
  return (
    <div className="intro" aria-hidden="true">
      <div className={`intro-bg ${phase}`} />
      <img ref={logoRef} className={`intro-logo ${phase}`} src="/logo.png" alt="" />
    </div>
  )
}
