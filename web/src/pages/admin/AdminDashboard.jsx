import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { listItems, createItem, updateItem, deleteItem, clearToken, isLoggedIn } from '../../lib/api'
import { CATEGORIES } from '../../lib/projects'
import ImageField from './ImageField'
import './admin.css'

// field config per resource
const RESOURCES = {
  projects: {
    label: 'Projects',
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
    label: 'Workers',
    columns: ['name', 'role'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
  team: {
    label: 'Team',
    columns: ['name', 'role'],
    fields: [
      { key: 'name', label: 'Name', required: true },
      { key: 'role', label: 'Role' },
      { key: 'image', label: 'Photo', type: 'image' },
      { key: 'sort_order', label: 'Sort order', type: 'number' },
    ],
  },
}

export default function AdminDashboard() {
  const nav = useNavigate()
  const [tab, setTab] = useState('projects')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)   // item object being edited, {} for new, null for none
  const [msg, setMsg] = useState('')

  useEffect(() => { if (!isLoggedIn()) nav('/admin/login') }, [nav])

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await listItems(tab)) }
    catch (e) { setMsg(e.message) }
    finally { setLoading(false) }
  }, [tab])

  useEffect(() => { load(); setEditing(null) }, [load])

  const cfg = RESOURCES[tab]

  const onDelete = async (item) => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    try { await deleteItem(tab, item.id); await load(); setMsg('Deleted') }
    catch (e) { setMsg(e.message) }
  }

  const onSave = async (data) => {
    try {
      if (editing.id) await updateItem(tab, editing.id, data)
      else await createItem(tab, data)
      setEditing(null); await load(); setMsg('Saved')
    } catch (e) { setMsg(e.message) }
  }

  const logout = () => { clearToken(); nav('/admin/login') }

  return (
    <div className="admin">
      <header className="admin-top">
        <div className="admin-brand">Fastbuilt Admin</div>
        <nav className="admin-tabs">
          {Object.entries(RESOURCES).map(([k, r]) => (
            <button key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{r.label}</button>
          ))}
        </nav>
        <button className="admin-logout" onClick={logout}>Log out</button>
      </header>

      {msg && <div className="admin-msg" onAnimationEnd={() => setMsg('')}>{msg}</div>}

      <main className="admin-main">
        <div className="admin-head">
          <h2>{cfg.label} <span className="admin-count">{items.length}</span></h2>
          <button className="btn-primary" onClick={() => setEditing({})}>+ Add {cfg.label.replace(/s$/, '')}</button>
        </div>

        {loading ? (
          <div className="admin-loading">Loading…</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                {cfg.columns.map((c) => <th key={c}>{c.replace('_', ' ')}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="admin-imgcell">
                    {it.image ? <img src={it.image.startsWith('http') || it.image.startsWith('/') ? it.image : `/images/color/${it.image}.jpg`} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} /> : '—'}
                  </td>
                  {cfg.columns.map((c) => <td key={c}>{it[c]}</td>)}
                  <td className="admin-actions">
                    <button onClick={() => setEditing(it)}>Edit</button>
                    <button className="danger" onClick={() => onDelete(it)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!items.length && <tr><td colSpan={cfg.columns.length + 2} className="admin-empty">No {cfg.label.toLowerCase()} yet.</td></tr>}
            </tbody>
          </table>
        )}
      </main>

      {editing && (
        <ItemForm cfg={cfg} initial={editing} onCancel={() => setEditing(null)} onSave={onSave} />
      )}
    </div>
  )
}

function ItemForm({ cfg, initial, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({ ...initial }))
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSave(form)
    setBusy(false)
  }

  return (
    <div className="admin-modal" onMouseDown={onCancel}>
      <form className="admin-form" onMouseDown={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{initial.id ? 'Edit' : 'Add'} {cfg.label.replace(/s$/, '')}</h3>
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
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </>
            ) : (
              <>
                <label>{f.label}{f.required && ' *'}</label>
                <input
                  type={f.type === 'number' ? 'number' : 'text'}
                  value={form[f.key] ?? ''}
                  onChange={(e) => set(f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)}
                  required={f.required}
                />
              </>
            )}
          </div>
        ))}
        <div className="af-buttons">
          <button type="button" onClick={onCancel}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
