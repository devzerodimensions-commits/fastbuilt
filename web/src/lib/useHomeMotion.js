import { useEffect } from 'react'
import Lenis from 'lenis'

// Smooth (inertia) scroll + big.dk-style "breathing":
// while scrolling the whole page content gently shrinks/recedes, and when
// scrolling stops it eases back up to full size. Plus subtle image parallax.
export default function useHomeMotion(scaleRef, deps = []) {
  useEffect(() => {
    const wrap = scaleRef.current
    if (!wrap) return
    // scale the whole scroll group (workers + projects) together — never the footer
    const scaleTarget = wrap.querySelector('.scroll-area') || wrap.querySelector('.projects') || wrap

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 1 })
    window.__lenis = lenis     // exposed so "Back to top" can scroll smoothly
    let vel = 0
    lenis.on('scroll', ({ velocity }) => { vel = velocity })

    // cached images may skip onLoad -> make sure they show
    wrap.querySelectorAll('.pimg img').forEach((im) => {
      if (im.complete && im.naturalWidth > 0) im.classList.add('loaded')
    })

    let raf
    let curScale = 1
    const MAX_SHRINK = 0.04     // shrink up to 4% while scrolling
    const loop = (t) => {
      lenis.raf(t)
      const vh = window.innerHeight

      // Freeze the motion while a project is open (auto-scroll to centre would otherwise
      // make the open image jitter/pulse). Keep scale at 1 and skip parallax.
      const isOpen = !!wrap.querySelector('.pitem.open')

      // 1) global shrink on scroll, ease back to 1 on stop (no shrink while open)
      const targetScale = isOpen ? 1 : (1 - Math.min(Math.abs(vel) * 0.0022, MAX_SHRINK))
      curScale += (targetScale - curScale) * 0.07     // smooth, springy return
      const scrollY = window.scrollY || window.pageYOffset
      const originY = scrollY + vh / 2 - scaleTarget.offsetTop
      scaleTarget.style.transformOrigin = `50% ${originY.toFixed(1)}px`
      scaleTarget.style.transform = `scale(${curScale.toFixed(4)})`

      // 2) subtle image parallax (paused while a project is open)
      if (!isOpen) {
        wrap.querySelectorAll('.pimg img').forEach((img) => {
          const frame = img.parentElement
          const r = frame.getBoundingClientRect()
          if (r.bottom < -100 || r.top > vh + 100) return
          const rel = ((r.top + r.height / 2) - vh / 2) / vh
          img.style.transform = `translate3d(0, ${(rel * -22).toFixed(2)}px, 0)`
        })
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      if (window.__lenis === lenis) window.__lenis = null
      lenis.destroy()
      if (scaleTarget) { scaleTarget.style.transform = ''; scaleTarget.style.transformOrigin = '' }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}
