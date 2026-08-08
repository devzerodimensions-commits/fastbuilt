import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchCategories } from '../lib/projects'

const CONTACT = {
  phone: '8347724798',
  email: 'harshk@fastbuilt.in',
  address: 'Gandhinagar, Gujarat',
  linkedin: 'https://www.linkedin.com/company/fastbuiltenterprise/about/',
}

export default function Header() {
  const [params] = useSearchParams()
  const active = params.get('cat')
  const [menuOpen, setMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const wrapRef = useRef(null)

  useEffect(() => { fetchCategories().then(setCategories) }, [])

  // close the dropdown when clicking outside / pressing Escape
  useEffect(() => {
    if (!menuOpen) return
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  return (
    <header className="header">
      <div className="hleft">
        <Link to="/" className="brand" aria-label="Fastbuilt home">
          <img src="/logo.png" alt="Fastbuilt" className="brand-logo" />
        </Link>
      </div>

      <div className="hright menu-wrap" ref={wrapRef}>
        <button
          className={`menu-btn ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <span></span><span></span><span></span>
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            {categories.map((c) => (
              <Link
                key={c}
                to={`/?cat=${encodeURIComponent(c)}`}
                className={active === c ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {c}
              </Link>
            ))}
            <Link to="/team" onClick={() => setMenuOpen(false)}>Team</Link>
            <Link to="/workers" onClick={() => setMenuOpen(false)}>Workers</Link>
          </div>
        )}
      </div>
    </header>
  )
}

export { CONTACT }
