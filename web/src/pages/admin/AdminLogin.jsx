import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../lib/api'
import './admin.css'

const EyeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeOffIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await login(username.trim(), password, remember)
      nav('/admin')
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={onSubmit}>
        <img src="/logo.png" alt="Fastbuilt" className="admin-logo" />
        <p>Sign in to manage the website content.</p>

        <label>Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus />

        <label>Password</label>
        <div className="admin-pw">
          <input
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="admin-pw-eye"
            onClick={() => setShowPw((s) => !s)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            title={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? EyeOffIcon : EyeIcon}
          </button>
        </div>

        {err && <div className="af-err">{err}</div>}

        <div className="admin-row">
          <label className="admin-check">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember Me
          </label>
          <button type="submit" className="admin-signin" disabled={busy}>
            {busy ? 'Signing in…' : 'Log In'}
          </button>
        </div>

        <Link className="admin-link" to="/admin/forgot">Lost your password?</Link>
      </form>
    </div>
  )
}
