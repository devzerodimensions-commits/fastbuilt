import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listItems, createItem, updateItem, deleteItem, clearToken, isLoggedIn } from '../../lib/api'
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
}

const ICONS = {
  dashboard: <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11 0h7v7h-7v-7zm0-11h7v7h-7V3z" />,
  projects: <path d="M4 21V9l8-6 8 6v12h-6v-6h-4v6H4z" />,
  workers: <path d="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />,
  team: <path d="M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 19c0-2.5 3-4 6-4s6 1.5 6 4v1H2v-1zm12.5-3.9c2.3.4 4.5 1.7 4.5 3.9v1h3v-1c0-2.3-3.2-3.6-6-3.9z" />,
  categories: <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />,
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

  useEffect(() => { if (!isLoggedIn()) nav('/admin/login') }, [nav])

  const loadCounts = useCallback(async () => {
    try {
      const [p, w, t, c] = await Promise.all([listItems('projects'), listItems('workers'), listItems('team'), listItems('categories')])
      setCounts({ projects: p.length, workers: w.length, team: t.length, categories: c.length })
      setCatOptions(c.map((x) => x.name))
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
  ]

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
          <div className="wp-crumb">{view === 'dashboard' ? 'Dashboard' : RESOURCES[view].label}</div>
          <div className="wp-top-right">
            <a href="/" target="_blank" rel="noreferrer" className="wp-visit">↗ Visit site</a>
            <span className="wp-user">👤 admin</span>
          </div>
        </header>

        <main className="wp-main">
          {view === 'dashboard'
            ? <Overview counts={counts} go={setView} />
            : <ResourceManager key={view} resource={view} cfg={RESOURCES[view]} onChanged={loadCounts} flash={flash} categoryOptions={catOptions} />}
        </main>
      </div>

      {msg && <div className="wp-toast" onAnimationEnd={() => setMsg('')}>{msg}</div>}
    </div>
  )
}

function Overview({ counts, go }) {
  const cards = [
    { key: 'projects', label: 'Projects', icon: 'projects', color: '#2271b1' },
    { key: 'workers', label: 'Workers', icon: 'workers', color: '#00a32a' },
    { key: 'team', label: 'Team', icon: 'team', color: '#8c5e58' },
    { key: 'categories', label: 'Categories', icon: 'categories', color: '#9a6700' },
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
    try { setItems(await listItems(resource)) }
    catch (e) { flash(e.message) }
    finally { setLoading(false) }
  }, [resource, flash])

  useEffect(() => { load() }, [load])

  const onDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
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
            ) : (
              <>
                <label>{f.label}{f.required && ' *'}</label>
                <input type={f.type === 'number' ? 'number' : 'text'} value={form[f.key] ?? ''}
                  onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} required={f.required} />
              </>
            )}
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
