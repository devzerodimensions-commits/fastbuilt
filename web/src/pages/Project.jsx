import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { fetchProjects, imgColor } from '../lib/projects'

export default function Project() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [all, setAll] = useState([])
  const [project, setProject] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    fetchProjects().then((list) => {
      setAll(list)
      const found = list.find((p) => p.slug === slug)
      if (found) setProject(found)
      else setNotFound(true)
    })
  }, [slug])

  // Translate vertical wheel into horizontal scroll (big.dk-style)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY
        e.preventDefault()
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [project])

  // Always start at the hero image when the project changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
  }, [slug, project])

  if (notFound) {
    return (
      <div className="loading">
        Project not found.
        <Link to="/" style={{ marginLeft: 8, textDecoration: 'underline' }}>Back to projects</Link>
      </div>
    )
  }
  if (!project) return <div className="loading">Loading…</div>

  const idx = all.findIndex((p) => p.slug === slug)
  const next = all[(idx + 1) % all.length]

  return (
    <>
      <div className="hscroll" ref={scrollRef}>
        <div className="htrack">
          {/* 1. HERO IMAGE first — shown/"selected" on open (full screen, colour) */}
          <section className="panel hero-img">
            <img src={imgColor(project.image)} alt={project.name} />
            <div className="hero-cap">
              <span className="hero-cat">{project.category} — {project.location}</span>
              <h1>{project.name}</h1>
            </div>
          </section>

          {/* 2. Overview — revealed as you scroll left */}
          <section className="panel intro">
            <div className="kicker">Overview</div>
            <p>{project.summary}</p>
          </section>

          {/* 3. Details / specs */}
          <section className="panel specs">
            <div className="spec-grid">
              <Spec label="Project Location" value={project.location} />
              <Spec label="Client" value={project.client} />
              <Spec label="Year Completed" value={project.year} />
              <Spec label="Project Status" value={project.status} />
              <Spec label="Contract Type" value={project.contract_type} />
              <Spec label="Team" value={project.team} />
            </div>
          </section>

          {/* 4. Second image */}
          <section className="panel image lit">
            <img src={imgColor(project.image)} alt={project.name} />
          </section>

          {/* 5. Next project */}
          <section className="panel end">
            <div className="next-label">Next project</div>
            <a className="next" onClick={() => navigate(`/project/${next.slug}`)} style={{ cursor: 'pointer' }}>
              {next.name} →
            </a>
            <Link to="/" className="back-home">← All projects</Link>
          </section>
        </div>
      </div>

      <div className="scroll-hint">Scroll →</div>
    </>
  )
}

function Spec({ label, value }) {
  return (
    <div className="spec">
      <label>{label}</label>
      <div>{value || '—'}</div>
    </div>
  )
}
