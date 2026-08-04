import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// big.dk-style intro:
//  1) logo centred on a black screen
//  2) the logo visibly travels UP-and-LEFT into the navbar spot (black still there)
//  3) once it's sitting at top-left, the black curtain lifts UP to reveal the site
export default function IntroLoader() {
  const [show, setShow] = useState(true)
  const [lift, setLift] = useState(false)   // curtain up + logo turns dark
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

    // (1) hold, then fly the logo UP-LEFT into the navbar — black stays, so it's clearly visible
    const t1 = setTimeout(() => {
      if (el) {
        el.style.transition = 'transform 1.1s cubic-bezier(.76, 0, .24, 1), filter .7s ease'
        const target = document.querySelector('.brand-logo')?.getBoundingClientRect()
        if (target && el.offsetHeight) {
          const s = target.height / el.offsetHeight
          el.style.transform = `translate(${target.left}px, ${target.top}px) scale(${s})`
        }
      }
    }, 1000)

    // (2) AS the logo is reaching the navbar (no pause), start lifting the black curtain
    const t2 = setTimeout(() => setLift(true), 1950)

    const t3 = setTimeout(() => { document.body.style.overflow = ''; setShow(false) }, 3250)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); document.body.style.overflow = '' }
  }, [])

  if (!show) return null
  return (
    <>
      <div className={`intro ${lift ? 'up' : ''}`} aria-hidden="true" />
      <img ref={logoRef} className={`intro-logo ${lift ? 'go' : ''}`} src="/logo.png" alt="" />
    </>
  )
}
