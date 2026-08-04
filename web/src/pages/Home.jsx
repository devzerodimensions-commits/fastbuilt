import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import CategoryIcon from '../components/CategoryIcon'
import InlineProject from '../components/InlineProject'
import useHomeMotion from '../lib/useHomeMotion'
import { fetchProjects, imgBW, imgLQIP } from '../lib/projects'

export default function Home() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [openSlug, setOpenSlug] = useState(null)
  const [params] = useSearchParams()
  const active = params.get('cat') || 'All'
  const scaleRef = useRef(null)

  useEffect(() => {
    fetchProjects().then((p) => {
      setProjects(p)
      setLoading(false)
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

  // when a project opens, smoothly centre it in the viewport (below the fixed header)
  useEffect(() => {
    if (!openSlug) return
    const t = setTimeout(() => {
      const el = document.querySelector('.pitem.open')
      if (!el) return
      // use layout offsets (not getBoundingClientRect) so the grow-scale animation
      // and the breathing transform don't distort the position
      let absTop = 0
      for (let n = el; n; n = n.offsetParent) absTop += n.offsetTop
      const headerH = 62
      const vh = window.innerHeight
      const finalH = vh * 0.56   // matches .pitem.open final height (grow animation)
      const targetY = absTop - headerH - Math.max(0, (vh - headerH - finalH) / 2)
      if (window.__lenis) window.__lenis.scrollTo(Math.max(0, targetY), { duration: 1 })
      else window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' })
    }, 80)
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
              <div className={`pitem ${open ? 'open' : ''}`} key={p.slug}>
                <div
                  className={`prow ${open ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => toggle(p.slug)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(p.slug))}
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
