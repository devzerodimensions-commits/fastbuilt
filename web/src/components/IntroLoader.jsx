import { useEffect, useState } from 'react'

// big.dk-style intro: logo centred on a black screen, then the whole black screen
// (with the logo) slides UP to reveal the site — the navbar logo sits top-left underneath.
export default function IntroLoader() {
  const [show, setShow] = useState(true)
  const [up, setUp] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const t1 = setTimeout(() => setUp(true), 1400)                       // hold, then lift the curtain
    const t2 = setTimeout(() => { document.body.style.overflow = ''; setShow(false) }, 2650)
    return () => { clearTimeout(t1); clearTimeout(t2); document.body.style.overflow = '' }
  }, [])

  if (!show) return null
  return (
    <div className={`intro ${up ? 'up' : ''}`} aria-hidden="true">
      <img className="intro-logo" src="/logo.png" alt="" />
    </div>
  )
}
