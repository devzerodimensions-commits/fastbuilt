import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  listItems, createItem, updateItem, deleteItem, clearToken, isLoggedIn,
  fetchMe, getSettings, saveSettings, changePassword,
} from '../../lib/api'
import { CATEGORIES } from '../../lib/projects'
import ImageField from './ImageField'
import './admin.css'

const RESOURCES = {
  projects: {
    label: 'Projects', single: 'Project',
    columns: ['name', 'category', 'location', 'year'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
      { key: 'location', label: 'Location' },
      { key: 'client', label: 'Client' },
      { key: 'year', label: 'Year' },
      { key: 'status', label: 'Status' },
      { key: 'contract_type', label: 'Contract Type' },
      { key: 'team', label: 'Team / Division' },
      { key: 'summary', label: 'Summary', type: 'textarea' },
      { key: 'image', label: 'Main image', type: 'image' },
      { key: 'image2', label: 'Second image (optional)', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  workers: {
    label: 'Workers', single: 'Worker',
    columns: ['name', 'role'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  team: {
    label: 'Team', single: 'Team member',
    columns: ['name', 'role'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  categories: {
    label: 'Categories', single: 'Category',
    columns: ['name'],
    fields: [
      { key: 'name', label: 'Category name', required: true },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  users: {
    label: 'Users', single: 'User', authList: true, resource: 'users',
    columns: ['username', 'email', 'role'],
    fields: [
      { key: 'username', label: 'Username', required: true, lockOnEdit: true },
      { key: 'name', label: 'Display name' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'role', label: 'Role', type: 'select', options: ['administrator', 'editor'], required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
}

const ICONS = {
  dashboard: <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11 0h7v7h-7v-7zm0-11h7v7h-7V3z" />,
  projects: <path d="M4 21V9l8-6 8 6v12h-6v-6h-4v6H4z" />,
  workers: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />,
  team: <path d="M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-2.5 3-4 6-4s6 1.5 6 4v1H2v-1zm12.5-3.9c2.3.4 4.5 1.7 4.5 3.9v1h3v-1c0-2.3-3.2-3.6-6-3.9z" />,
  categories: <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
  users: <path d="M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-2.5 3-4 6-4s6 1.5 6 4v1H2v-1zm12.5-3.9c2.3.4 4.5 1.7 4.5 3.9v1h3v-1c0-2.3-3.2-3.6-6-3.9z" />,
  settings: <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm8.94 4a7 7 0 00-.15-1.4l2.02-1.58-2-3.46-2.39.96a7 7 0 00-2.42-1.4L15.6 2h-4l-.4 2.72a7 7 0 00-2.42 1.4l-2.39-.96-2 3.46 2.02 1.58a7 7 0 000 2.8L2 14.58l2 3.46 2.39-.96a7 7 0 002.42 1.4L11.6 22h4l.4-2.72a7 7 0 002.42-1.4l2.39.96 2-3.46-2.02-1.58c.1-.46.15-.93.15-1.4z" />,
}
const Icon = ({ name }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">{ICONS[name]}</svg>
)

export default function AdminDashboard() {
  const nav = useNavigate()
  const [view, setView] = useState('dashboard')
  const [counts, setCounts] = useState(null)
  const [catOptions, setCatOptions] = useState([])
  const [msg, setMsg] = useState('')
  const [me, setMe] = useState(null)

  useEffect(() => { if (!isLoggedIn()) nav('/admin/login') }, [nav])
  useEffect(() => { fetchMe().then(setMe).catch(() => setMe({ user: 'admin', role: 'administrator' })) }, [])

  const isAdmin = !me || me.role === 'administrator'

  const loadCounts = useCallback(async () => {
    try {
      const [p, w, t, c] = await Promise.all([listItems('projects'), listItems('workers'), listItems('team'), listItems('categories')])
      const next = { projects: p.length, workers: w.length, team: t.length, categories: c.length }
      setCatOptions(c.map((x) => x.name))
      try { const u = await listItems('users', true); next.users = u.length } catch { /* non-admin */ }
      setCounts(next)
    } catch { setCounts({ projects: 0, workers: 0, team: 0, categories: 0 }) }
  }, [])

  useEffect(() => { loadCounts() }, [loadCounts])

  const logout = () => { clearToken(); nav('/admin/login') }
  const flash = (m) => setMsg(m)

  const menu = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'projects', label: 'Projects', icon: 'projects' },
    { key: 'workers', label: 'Workers', icon: 'workers' },
    { key: 'team', label: 'Team', icon: 'team' },
    { key: 'categories', label: 'Categories', icon: 'categories' },
    ...(isAdmin ? [
      { key: 'users', label: 'Users', icon: 'users' },
      { key: 'settings', label: 'Settings', icon: 'settings' },
    ] : []),
  ]

  const crumb = view === 'dashboard' ? 'Dashboard' : view === 'settings' ? 'Settings' : RESOURCES[view].label

  return (
    <div className="wp">
      <aside className="wp-side">
        <div className="wp-brand">Fastbuilt<span>admin</span></div>
        <nav className="wp-menu">
          {menu.map((m) => (
            <button key={m.key} className={view === m.key ? 'active' : ''} onClick={() => setView(m.key)}>
              <Icon name={m.icon} /> <span>{m.label}</span>
            </button>
          ))}
        </nav>
        <button className="wp-logout" onClick={logout}>↩ Log out</button>
      </aside>

      <div className="wp-body">
        <header className="wp-topbar">
          <div className="wp-crumb">{crumb}</div>
          <div className="wp-top-right">
            <a href="/" target="_blank" rel="noreferrer" className="wp-visit">↗ Visit site</a>
            <span className="wp-user">👤 {me?.user || 'admin'}{me?.role ? ` · ${me.role}` : ''}</span>
          </div>
        </header>

        <main className="wp-main">
          {view === 'dashboard' && <Overview counts={counts} go={setView} isAdmin={isAdmin} />}
          {view === 'settings' && <SettingsManager flash={flash} />}
          {view !== 'dashboard' && view !== 'settings' && (
            <ResourceManager key={view} resource={RESOURCES[view].resource || view} cfg={RESOURCES[view]} onChanged={loadCounts} flash={flash} categoryOptions={catOptions} />
          )}
        </main>
      </div>

      {msg && <div className="wp-toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}
    </div>
  )
}

function Overview({ counts, go, isAdmin }) {
  const cards = [
    { key: 'projects', label: 'Projects', icon: 'projects', color: '#1d2327' },
    { key: 'workers', label: 'Workers', icon: 'workers', color: '#3c434a' },
    { key: 'team', label: 'Team', icon: 'team', color: '#646970' },
    { key: 'categories', label: 'Categories', icon: 'categories', color: '#8c8f94' },
    ...(isAdmin ? [{ key: 'users', label: 'Users', icon: 'users', color: '#1d2327' }] : []),
  ]
  return (
    <>
      <h1 className="wp-h1">Welcome back 👋</h1>
      <p className="wp-sub">Manage your website content below. Changes go live on the site automatically.</p>
      <div className="wp-cards">
        {cards.map((c) => (
          <button key={c.key} className="wp-card" onClick={() => go(c.key)} style={{ '--c': c.color }}>
            <span className="wp-card-ic"><Icon name={c.icon} /></span>
            <span className="wp-card-n">{counts ? counts[c.key] : '—'}</span>
            <span className="wp-card-l">{c.label}</span>
            <span className="wp-card-go">Manage →</span>
          </button>
        ))}
      </div>
    </>
  )
}

function ResourceManager({ resource, cfg, onChanged, flash, categoryOptions }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await listItems(resource, cfg.authList)) }
    catch (e) { flash(e.message) }
    finally { setLoading(false) }
  }, [resource, cfg.authList, flash])

  useEffect(() => { load() }, [load])

  const onDelete = async (item) => {
    const label = item.name || item.username || item.email || 'this item'
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    try { await deleteItem(resource, item.id); await load(); onChanged(); flash('Deleted') }
    catch (e) { flash(e.message) }
  }
  const onSave = async (data) => {
    try {
      if (editing.id) await updateItem(resource, editing.id, data)
      else await createItem(resource, data)
      setEditing(null); await load(); onChanged(); flash('Saved')
    } catch (e) { flash(e.message) }
  }

  const imgSrc = (v) => !v ? null : (v.startsWith('http') || v.startsWith('/') ? v : `/images/color/${v}.jpg`)

  return (
    <>
      <div className="wp-head">
        <h1 className="wp-h1">{cfg.label} <span className="wp-count">{items.length}</span></h1>
        <button className="wp-btn" onClick={() => setEditing({})}>+ Add {cfg.single}</button>
      </div>

      {loading ? <div className="wp-loading">Loading…</div> : (
        <div className="wp-table-wrap">
          <table className="wp-table">
            <thead>
              <tr>
                <th className="wp-th-img"></th>
                {cfg.columns.map((c) => <th key={c}>{c.replace('_', ' ')}</th>)}
                <th className="wp-th-act"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="wp-td-img">{imgSrc(it.image)
                    ? <img src={imgSrc(it.image)} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
                    : <span className="wp-noimg">—</span>}</td>
                  {cfg.columns.map((c) => <td key={c}>{it[c]}</td>)}
                  <td className="wp-td-act">
                    <button onClick={() => setEditing(it)}>Edit</button>
                    <button className="danger" onClick={() => onDelete(it)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={cfg.columns.length + 2} className="wp-empty">No {cfg.label.toLowerCase()} yet. Click “Add {cfg.single}”.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {editing && <ItemForm cfg={cfg} initial={editing} onCancel={() => setEditing(null)} onSave={onSave} categoryOptions={categoryOptions} />}
    </>
  )
}

function ItemForm({ cfg, initial, onCancel, onSave, categoryOptions }) {
  const [form, setForm] = useState(() => ({ ...initial }))
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const submit = async (e) => { e.preventDefault(); setBusy(true); await onSave(form); setBusy(false) }
  const optionsFor = (f) => (f.key === 'category' && categoryOptions && categoryOptions.length ? categoryOptions : f.options)

  return (
    <div className="wp-modal" onMouseDown={onCancel}>
      <form className="wp-form" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{initial.id ? 'Edit' : 'Add'} {cfg.single}</h3>
        {cfg.fields.map((f) => (
          <div className="af-row" key={f.key}>
            {f.type === 'image' ? (
              <ImageField label={f.label} value={form[f.key]} onChange={(v) => set(f.key, v)} />
            ) : f.type === 'textarea' ? (
              <>
                <label>{f.label}</label>
                <textarea rows={4} value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
              </>
            ) : f.type === 'select' ? (
              <>
                <label>{f.label}{f.required && ' *'}</label>
                <select value={form[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} required={f.required}>
                  <option value="">— choose —</option>
                  {optionsFor(f).map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </>
            ) : (() => {
              const isEdit = !!initial.id
              const inputType = f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'password' ? 'password' : 'text'
              const locked = f.lockOnEdit && isEdit
              // password is required on create, optional on edit (blank = keep current)
              const required = f.required && !(f.type === 'password' && isEdit) && !locked
              return (
                <>
                  <label>{f.label}{required && ' *'}</label>
                  <input
                    type={inputType}
                    value={form[f.key] ?? ''}
                    disabled={locked}
                    placeholder={f.type === 'password' && isEdit ? 'Leave blank to keep current' : ''}
                    autoComplete={f.type === 'password' ? 'new-password' : 'off'}
                    onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                    required={required}
                  />
                </>
              )
            })()}
          </div>
        ))}
        <div className="af-buttons">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="wp-btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}

const GENERAL_FIELDS = [
  { key: 'site_title', label: 'Site title' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'contact_phone', label: 'Contact phone' },
  { key: 'contact_email', label: 'Contact email' },
  { key: 'contact_address', label: 'Address' },
  { key: 'contact_linkedin', label: 'LinkedIn URL' },
]

function SettingsManager({ flash }) {
  const [tab, setTab] = useState('general')
  const [s, setS] = useState(null)
  const [busy, setBusy] = useState(false)
  const [cur, setCur] = useState(''); const [np, setNp] = useState(''); const [np2, setNp2] = useState('')

  useEffect(() => { getSettings().then(setS).catch(() => setS({})) }, [])
  const set = (k, v) => setS((p) => ({ ...p, [k]: v }))

  const saveGeneral = async (e) => {
    e.preventDefault(); setBusy(true)
    try { await saveSettings(s); flash('Settings saved — live on the site') }
    catch (ex) { flash(ex.message) } finally { setBusy(false) }
  }
  const savePw = async (e) => {
    e.preventDefault()
    if (np.length < 6) return flash('New password must be at least 6 characters')
    if (np !== np2) return flash('New passwords do not match')
    setBusy(true)
    try { await changePassword(cur, np); setCur(''); setNp(''); setNp2(''); flash('Password changed') }
    catch (ex) { flash(ex.message) } finally { setBusy(false) }
  }

  if (!s) return <div className="wp-loading">Loading…</div>

  return (
    <>
      <h1 className="wp-h1">Settings</h1>
      <div className="wp-tabs">
        <button className={tab === 'general' ? 'active' : ''} onClick={() => setTab('general')}>General</button>
        <button className={tab === 'account' ? 'active' : ''} onClick={() => setTab('account')}>Account</button>
      </div>

      {tab === 'general' ? (
        <form className="wp-settings" onSubmit={saveGeneral}>
          <p className="wp-sub">These appear in the site header, footer and contact links.</p>
          {GENERAL_FIELDS.map((f) => (
            <div className="af-row" key={f.key}>
              <label>{f.label}</label>
              <input value={s[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
            </div>
          ))}
          <div className="af-row">
            <ImageField label="Favicon (browser tab icon)" value={s.favicon} onChange={(v) => set('favicon', v)} />
            <span className="wp-hint">Upload a small square image (PNG/ICO). Leave as-is to keep the default “F” icon.</span>
          </div>
          <button type="submit" className="wp-btn" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
        </form>
      ) : (
        <form className="wp-settings" onSubmit={savePw}>
          <p className="wp-sub">Change your own login password.</p>
          <div className="af-row">
            <label>Current password</label>
            <input type="password" value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="af-row">
            <label>New password</label>
            <input type="password" value={np} onChange={(e) => setNp(e.target.value)} autoComplete="new-password" />
          </div>
          <div className="af-row">
            <label>Confirm new password</label>
            <input type="password" value={np2} onChange={(e) => setNp2(e.target.value)} autoComplete="new-password" />
          </div>
          <button type="submit" className="wp-btn" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</button>
        </form>
      )}
    </>
  )
}
