import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../lib/api'
import './admin.css'

export default function AdminForgot() {
  const [identifier, setIdentifier] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await forgotPassword(identifier.trim())
      setSent(true)
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
        {sent ? (
          <>
            <p style={{ marginBottom: 8 }}>
              If an account matches that username or email, a password reset link has been
              sent to its email address. The link is valid for <b>1 hour</b>.
            </p>
            <p className="admin-note">Didn’t get it? Check your spam folder, or try again.</p>
            <Link className="admin-link" to="/admin/login">← Back to login</Link>
          </>
        ) : (
          <>
            <p>Enter your username or email and we’ll send you a link to reset your password.</p>
            <label>Username or email</label>
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoFocus />
            {err && <div className="af-err">{err}</div>}
            <button type="submit" disabled={busy || !identifier.trim()}>
              {busy ? 'Sending…' : 'Send reset link'}
            </button>
            <Link className="admin-link" to="/admin/login">← Back to login</Link>
          </>
        )}
      </form>
    </div>
  )
}
