import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../lib/api'
import './admin.css'

export default function AdminReset() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    if (pw.length < 6) return setErr('Password must be at least 6 characters.')
    if (pw !== pw2) return setErr('Passwords do not match.')
    setBusy(true)
    try {
      await resetPassword(token, pw)
      setDone(true)
      setTimeout(() => nav('/admin/login'), 2200)
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
        {!token ? (
          <>
            <p>This reset link is missing or invalid. Please request a new one.</p>
            <Link className="admin-link" to="/admin/forgot">Request a new link</Link>
          </>
        ) : done ? (
          <>
            <p>✓ Your password has been reset. Redirecting you to login…</p>
            <Link className="admin-link" to="/admin/login">Go to login now</Link>
          </>
        ) : (
          <>
            <p>Choose a new password for your admin account.</p>
            <label>New password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
            <label>Confirm new password</label>
            <input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            {err && <div className="af-err">{err}</div>}
            <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Set new password'}</button>
            <Link className="admin-link" to="/admin/login">← Back to login</Link>
          </>
        )}
      </form>
    </div>
  )
}
