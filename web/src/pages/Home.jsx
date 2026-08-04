import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import CategoryIcon from '../components/CategoryIcon'
import InlineProject from '../components/InlineProject'
import useHomeMotion from '../lib/useHomeMotion'
import { fetchProjects, imgBW, imgColor, imgLQIP } from '../lib/projects'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [openSlug, setOpenSlug] = useState(null)
  const [fromH, setFromH] = useState(0)   // closed height of the clicked project (grow starts from here)
  const [params] = useSearchParams()
  const active = params.get('cat') || 'All'
  const scaleRef = useRef(null)

  useEffect(() => {
    fetchProjects().then((p) => {
      setProjects(p)
      setLoading(false)
      // preload the full-colour images so opening a project never flashes/blank
      p.forEach((pr) => {
        const im = new Image(); im.src = imgColor(pr.image)
        if (pr.image2) { const im2 = new Image(); im2.src = imgColor(pr.image2) }
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

  // capture the project's current (closed) height so it grows FROM that size
  const onRowClick = (slug, e) => {
    if (openSlug !== slug) {
      const pit = e.currentTarget.closest('.pitem')
      setFromH(pit ? pit.offsetHeight : 0)
    }
    toggle(slug)
  }

  // when a project opens, smoothly centre it in the viewport (below the fixed header)
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
      // scroll in sync with the 0.85s grow so the two motions feel like one
      if (window.__lenis) window.__lenis.scrollTo(targetY, { duration: 0.85 })
      else window.scrollTo({ top: targetY, behavior: 'smooth' })
    }, 20)
    return () => clearTimeout(t)
  }, [openSlug])

  return (
    <>
      {loading ? (
        <div className="loading">Loading projects…</div>
      ) : (
        <div className="page-scale" ref={scaleRef}>
        <div className="projects">
          {filtered.map((p, i) => {
            const open = p.slug === openSlug
            return (
              <div
                className={`pitem ${open ? 'open' : ''}`}
                key={p.slug}
                style={open ? { '--from-h': `${fromH}px` } : undefined}
              >
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
                    <img src={imgBW(p.image)} alt={p.name} loading="lazy"
                      onLoad={(e) => e.currentTarget.classList.add('loaded')} />
                  </div>
                </div>

                {/* Inline expand — grows to 60vh, info scrolls HORIZONTALLY (name first) */}
                {open && <InlineProject project={p} onClose={() => toggle(p.slug)} />}
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
