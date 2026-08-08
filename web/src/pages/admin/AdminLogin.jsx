import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../../lib/api'
import './admin.css'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(''); setBusy(true)
    try {
      await login(username.trim(), password)
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
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div className="af-err">{err}</div>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link className="admin-link" to="/admin/forgot">Forgot your password?</Link>
      </form>
    </div>
  )
}
