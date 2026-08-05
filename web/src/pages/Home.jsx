import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import CategoryIcon from '../components/CategoryIcon'
import InlineProject from '../components/InlineProject'
import useHomeMotion from '../lib/useHomeMotion'
import { fetchProjects, imgColor, imgLQIP } from '../lib/projects'
import { WORKERS, imgWorker } from '../lib/workers'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [openSlug, setOpenSlug] = useState(null)
  const [flipFrom, setFlipFrom] = useState(null)   // clicked thumbnail's rect (for the FLIP grow)
  const [params] = useSearchParams()
  const active = params.get('cat') || 'All'
  const scaleRef = useRef(null)

  useEffect(() => {
    fetchProjects().then((p) => {
      setProjects(p)
      setLoading(false)
      // preload + decode the full-colour images so opening never pauses/flashes
      const warm = (src) => { const im = new Image(); im.src = src; im.decode && im.decode().catch(() => {}) }
      p.forEach((pr) => {
        warm(imgColor(pr.image))
        if (pr.image2) warm(imgColor(pr.image2))
      })
    })
  }, [])

  const filtered = useMemo(
    () => (active === 'All' ? projects : projects.filter((p) => p.category === active)),
    [projects, active]
  )

  // close any open project when the filter changes
  useEffect(() => { setOpenSlug(null) }, [active])

  useHomeMotion(scaleRef, [loading, active, filtered.length])

  const toggle = (slug) => setOpenSlug((s) => (s === slug ? null : slug))

  // capture the clicked thumbnail's exact rect so the SAME image grows from there (FLIP)
  const onRowClick = (slug, e) => {
    if (openSlug !== slug) {
      const thumb = e.currentTarget.querySelector('.pimg img')
      setFlipFrom(thumb ? thumb.getBoundingClientRect() : null)
    }
    toggle(slug)
  }

  // centre the opened project vertically in the viewport (works with the FLIP,
  // since scrolling moves everything uniformly)
  useEffect(() => {
    if (!openSlug) return
    const t = setTimeout(() => {
      const el = document.querySelector('.pitem.open')
      if (!el) return
      let absTop = 0
      for (let n = el; n; n = n.offsetParent) absTop += n.offsetTop
      const headerH = 62
      const vh = window.innerHeight
      const finalH = vh * 0.56
      const targetY = Math.max(0, absTop - headerH - Math.max(0, (vh - headerH - finalH) / 2))
      if (window.__lenis) window.__lenis.scrollTo(targetY, { duration: 1.2 })
      else window.scrollTo({ top: targetY, behavior: 'smooth' })
    }, 30)
    return () => clearTimeout(t)
  }, [openSlug])

  return (
    <>
      {loading ? (
        <div className="loading">Loading projects…</div>
      ) : (
        <div className="page-scale" ref={scaleRef}>
        {/* WORKERS — exactly the project-row layout: icon + name + role left, image right */}
        <section className="wsection">
          <h2 className="home-shead">Our Workforce</h2>
          {WORKERS.map((w) => (
            <div className="wrow" key={w.img}>
              <div className="wmeta">
                <span className="wicon">
                  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="40" height="40" fill="#111" />
                    <circle cx="20" cy="16" r="4.6" stroke="#fff" strokeWidth="1.8" />
                    <path d="M11 30c0-5 4-8.5 9-8.5s9 3.5 9 8.5" stroke="#fff" strokeWidth="1.8" />
                  </svg>
                </span>
                <div className="wname">{w.name}</div>
                <div className="wrole">{w.role}</div>
              </div>
              <div className="wimg">
                <img src={imgWorker(w.img)} alt={w.name} loading="lazy" />
              </div>
            </div>
          ))}
        </section>

        <h2 className="home-shead">Projects</h2>
        <div className="projects">
          {filtered.map((p, i) => {
            const open = p.slug === openSlug
            return (
              <div className={`pitem ${open ? 'open' : ''}`} key={p.slug}>
                <div
                  className={`prow ${open ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={(e) => onRowClick(p.slug, e)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRowClick(p.slug, e))}
                >
                  <div className="pmeta">
                    <CategoryIcon category={p.category} />
                    <div className="pname">{p.name}</div>
                    <div className="ploc">{p.location}</div>
                  </div>
                  <div className="pimg">
                    <span className="lqip" style={{ backgroundImage: `url(${imgLQIP(p.image)})` }} aria-hidden="true" />
                    {/* same COLOUR file as the open view (shown B&W via CSS) so opening reuses it — no reload/pause */}
                    <img src={imgColor(p.image)} alt={p.name}
                      onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                  </div>
                </div>

                {/* Inline expand — grows to 60vh, info scrolls HORIZONTALLY (name first) */}
                {open && <InlineProject project={p} flipFrom={flipFrom} onClose={() => toggle(p.slug)} />}
              </div>
            )
          })}
        </div>
        <Footer />
        </div>
      )}
    </>
  )
}
