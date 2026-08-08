import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../lib/projects'
import { useSettings } from '../lib/settings'

export default function Footer() {
  const s = useSettings()
  const SECTIONS = [
    {
      title: 'Office',
      render: () => (
        <>
          <p>{s.site_title || 'Fastbuilt'} Enterprise</p>
          <p>{s.contact_address}</p>
        </>
      ),
    },
    {
      title: 'Contact',
      render: () => (
        <>
          {s.contact_phone && <a href={`tel:${s.contact_phone}`}>{s.contact_phone}</a>}
          {s.contact_email && <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>}
        </>
      ),
    },
    {
      title: 'Capabilities',
      render: () => (
        <>
          {CATEGORIES.map((c) => (
            <Link key={c} to={`/?cat=${encodeURIComponent(c)}`}>{c}</Link>
          ))}
        </>
      ),
    },
    {
      title: 'Follow',
      render: () =>
        s.contact_linkedin ? (
          <a href={s.contact_linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        ) : null,
    },
  ]

  const [open, setOpen] = useState(() => new Set())

  const toggle = (i) =>
    setOpen((prev) => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })

  return (
    <footer className="footer">
      <div className="facc">
        {SECTIONS.map((s, i) => {
          const isOpen = open.has(i)
          return (
            <div className={`facc-item ${isOpen ? 'open' : ''}`} key={s.title}>
              <button className="facc-head" onClick={() => toggle(i)} aria-expanded={isOpen}>
                <span className="facc-plus" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="facc-title">{s.title}</span>
              </button>
              <div className={`facc-body ${isOpen ? 'open' : ''}`}>
                <div className="facc-body-inner">{s.render()}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="fbottom">
        <span>© {new Date().getFullYear()} {s.site_title || 'Fastbuilt'} Enterprise</span>
        <button
          className="back-to-top"
          onClick={() => {
            if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.2 })
            else window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
