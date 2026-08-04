import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Footer from '../components/Footer'
import CategoryIcon from '../components/CategoryIcon'
import InlineProject from '../components/InlineProject'
import useHomeMotion from '../lib/useHomeMotion'
import { fetchProjects, imgColor, imgLQIP } from '../lib/projects'

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
