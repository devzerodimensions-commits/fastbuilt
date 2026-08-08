import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper from 'react-easy-crop'
import { listMedia, createMedia, updateMedia, deleteMedia, uploadImageFull, cloudinaryConfigured } from '../../lib/api'
import { fileToWebp } from '../../lib/webp'
import { getEditedWebp } from '../../lib/imageEdit'

const fmtBytes = (b) => (!b ? '—' : b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB')
const fmtDate = (d) => { try { return new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' } }

export default function MediaLibrary({ flash, onChanged }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [selected, setSelected] = useState(null)   // details panel
  const [editing, setEditing] = useState(null)     // edit modal
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await listMedia()) } catch (e) { flash(e.message) } finally { setLoading(false) }
  }, [flash])
  useEffect(() => { load() }, [load])

  const onFiles = async (e) => {
    const files = [...(e.target.files || [])]
    if (!files.length) return
    setBusy(true)
    let ok = 0
    for (const file of files) {
      try {
        const webp = await fileToWebp(file)
        const up = await uploadImageFull(webp)
        await createMedia({ url: up.secure_url, public_id: up.public_id, filename: file.name, format: up.format, width: up.width, height: up.height, bytes: up.bytes })
        ok++
      } catch (ex) { flash(ex.message) }
    }
    setBusy(false)
    if (fileRef.current) fileRef.current.value = ''
    if (ok) { flash(`Uploaded ${ok} image${ok > 1 ? 's' : ''}`); await load(); onChanged && onChanged() }
  }

  const onDelete = async (item) => {
    if (!confirm(`Delete "${item.filename || 'this image'}" permanently? This cannot be undone.`)) return
    try { await deleteMedia(item.id); setSelected(null); await load(); onChanged && onChanged(); flash('Deleted') }
    catch (e) { flash(e.message) }
  }

  const saveAlt = async (item, alt) => {
    try { const u = await updateMedia(item.id, { alt }); setSelected(u); setItems((xs) => xs.map((x) => x.id === u.id ? u : x)); flash('Saved') }
    catch (e) { flash(e.message) }
  }

  const copyUrl = (url) => { navigator.clipboard?.writeText(url).then(() => flash('URL copied')).catch(() => flash('Copy failed')) }

  return (
    <>
      <div className="wp-head">
        <h1 className="wp-h1">Media Library <span className="wp-count">{items.length}</span></h1>
        {cloudinaryConfigured() ? (
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{ display: 'none' }} />
            <button className="wp-btn" disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? 'Uploading…' : '+ Add New'}</button>
          </>
        ) : <span className="wp-hint">Set Cloudinary env vars to enable uploads</span>}
      </div>

      {loading ? <div className="wp-loading">Loading…</div> : !items.length ? (
        <div className="wp-empty" style={{ padding: 40 }}>No media yet. Click “Add New” to upload images.</div>
      ) : (
        <div className="media-grid">
          {items.map((it) => (
            <button key={it.id} className="media-cell" onClick={() => setSelected(it)} title={it.filename || ''}>
              <img src={it.url} alt={it.alt || ''} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {selected && (
        <MediaDetails
          item={selected}
          onClose={() => setSelected(null)}
          onDelete={() => onDelete(selected)}
          onEdit={() => setEditing(selected)}
          onCopy={() => copyUrl(selected.url)}
          onSaveAlt={(alt) => saveAlt(selected, alt)}
        />
      )}

      {editing && (
        <ImageEditor
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={async (updated) => { setEditing(null); setSelected(updated); await load(); onChanged && onChanged() }}
          flash={flash}
        />
      )}
    </>
  )
}

function MediaDetails({ item, onClose, onDelete, onEdit, onCopy, onSaveAlt }) {
  const [alt, setAlt] = useState(item.alt || '')
  useEffect(() => { setAlt(item.alt || '') }, [item])
  return (
    <div className="wp-modal" onMouseDown={onClose}>
      <div className="media-details" onMouseDown={(e) => e.stopPropagation()}>
        <div className="media-details-preview"><img src={item.url} alt={item.alt || ''} /></div>
        <div className="media-details-info">
          <div className="mdi-head">
            <h3>Attachment details</h3>
            <button className="mdi-x" onClick={onClose} aria-label="Close">×</button>
          </div>
          <p className="mdi-file">{item.filename || '(no name)'}</p>
          <dl className="mdi-meta">
            <div><dt>Type</dt><dd>{item.format ? item.format.toUpperCase() : '—'}</dd></div>
            <div><dt>Dimensions</dt><dd>{item.width && item.height ? `${item.width} × ${item.height}` : '—'}</dd></div>
            <div><dt>Size</dt><dd>{fmtBytes(item.bytes)}</dd></div>
            <div><dt>Uploaded</dt><dd>{fmtDate(item.created_at)}</dd></div>
          </dl>
          <label className="mdi-label">Alt text</label>
          <input className="mdi-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe this image" />
          <label className="mdi-label">File URL</label>
          <div className="mdi-url"><input readOnly value={item.url} onFocus={(e) => e.target.select()} /><button onClick={onCopy}>Copy</button></div>
          <div className="mdi-actions">
            <button className="wp-btn" onClick={onEdit}>Edit image</button>
            <button className="wp-btn ghost" onClick={() => onSaveAlt(alt)}>Save</button>
            <button className="mdi-del" onClick={onDelete}>Delete permanently</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const ASPECTS = [
  { label: 'Original', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '16:9', value: 16 / 9 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
]

function ImageEditor({ item, onClose, onSaved, flash }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipH, setFlipH] = useState(false)
  const [flipV, setFlipV] = useState(false)
  const [aspectKey, setAspectKey] = useState('original')
  const [cropPixels, setCropPixels] = useState(null)
  const [saving, setSaving] = useState(false)

  const originalAspect = item.width && item.height ? item.width / item.height : 1
  const aspect = aspectKey === 'original' ? originalAspect : aspectKey

  const onCropComplete = useCallback((_area, areaPixels) => setCropPixels(areaPixels), [])

  const save = async () => {
    if (!cropPixels) return
    setSaving(true)
    try {
      const { file, width, height } = await getEditedWebp(item.url, cropPixels, rotation, { horizontal: flipH, vertical: flipV }, item.filename || 'edited')
      const up = await uploadImageFull(file)
      const updated = await updateMedia(item.id, { url: up.secure_url, public_id: up.public_id, width: up.width || width, height: up.height || height, bytes: up.bytes })
      flash('Image updated')
      onSaved(updated)
    } catch (e) {
      flash(e.message?.includes('tainted') || e.name === 'SecurityError' ? 'Could not edit this image (cross-origin). Try re-uploading it.' : (e.message || 'Edit failed'))
    } finally { setSaving(false) }
  }

  return (
    <div className="wp-modal" onMouseDown={onClose}>
      <div className="media-editor" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mdi-head"><h3>Edit image</h3><button className="mdi-x" onClick={onClose} aria-label="Close">×</button></div>
        <div className="media-crop-area">
          <Cropper
            image={item.url}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
            restrictPosition={false}
          />
        </div>
        <div className="media-tools">
          <div className="mt-row">
            <span className="mt-label">Aspect</span>
            {ASPECTS.map((a) => (
              <button key={a.label} className={aspectKey === a.value ? 'active' : ''} onClick={() => setAspectKey(a.value)}>{a.label}</button>
            ))}
          </div>
          <div className="mt-row">
            <span className="mt-label">Rotate</span>
            <button onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>⟲ Left</button>
            <button onClick={() => setRotation((r) => (r + 90) % 360)}>⟳ Right</button>
            <span className="mt-label">Flip</span>
            <button className={flipH ? 'active' : ''} onClick={() => setFlipH((f) => !f)}>↔ Horizontal</button>
            <button className={flipV ? 'active' : ''} onClick={() => setFlipV((f) => !f)}>↕ Vertical</button>
          </div>
          <div className="mt-row">
            <span className="mt-label">Zoom</span>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
          </div>
          <p className="wp-hint">Flip is applied when you save. Editing creates a new WebP and updates this item.</p>
        </div>
        <div className="af-buttons">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="wp-btn" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save edits'}</button>
        </div>
      </div>
    </div>
  )
}
