import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// big.dk-style intro: logo centred on a black screen, then in ONE motion the black
// curtain lifts UP while the logo flies up-and-LEFT into the navbar spot (top-left).
export default function IntroLoader() {
  const [show, setShow] = useState(true)
  const [go, setGo] = useState(false)
  const logoRef = useRef(null)

  // place the logo dead-centre instantly (no transition) before first paint
  useLayoutEffect(() => {
    const el = logoRef.current
    if (!el) return
    el.style.transition = 'none'
    const w = el.offsetWidth, h = el.offsetHeight
    el.style.transform = `translate(${(window.innerWidth - w) / 2}px, ${(window.innerHeight - h) / 2}px)`
    el.getBoundingClientRect()   // flush
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const el = logoRef.current

    // hold, then: lift the black curtain UP + fly the logo up-left into the navbar together
    const t1 = setTimeout(() => {
      if (el) {
        el.style.transition = 'transform 1.15s cubic-bezier(.76, 0, .24, 1), filter .9s ease'
        const target = document.querySelector('.brand-logo')?.getBoundingClientRect()
        if (target && el.offsetHeight) {
          const s = target.height / el.offsetHeight
          el.style.transform = `translate(${target.left}px, ${target.top}px) scale(${s})`
        }
      }
      setGo(true)
    }, 1300)

    const t2 = setTimeout(() => { document.body.style.overflow = ''; setShow(false) }, 2600)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])

  if (!show) return null
  return (
    <>
      <div className={`intro ${go ? 'up' : ''}`} aria-hidden="true" />
      <img ref={logoRef} className={`intro-logo ${go ? 'go' : ''}`} src="/logo.png" alt="" />
    </>
  )
}
