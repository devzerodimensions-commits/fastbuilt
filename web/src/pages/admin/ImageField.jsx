import { useRef, useState } from 'react'
import { uploadImage, cloudinaryConfigured } from '../../lib/api'
import { imgColor } from '../../lib/projects'

// Image input: upload to Cloudinary (if configured) or paste a URL. Stores the final URL/key.
export default function ImageField({ label, value, onChange }) {
  const fileRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setErr(''); setBusy(true)
    try {
      const url = await uploadImage(file)
      onChange(url)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="af-image">
      <label>{label}</label>
      <div className="af-image-row">
        {value ? (
          <img className="af-thumb" src={imgColor(value)} alt="" onError={(e) => (e.currentTarget.style.visibility = 'hidden')} />
        ) : (
          <div className="af-thumb af-thumb-empty">No image</div>
        )}
        <div className="af-image-controls">
          {cloudinaryConfigured() && (
            <>
              <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
              <button type="button" className="btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
                {busy ? 'Uploading…' : 'Upload image'}
              </button>
            </>
          )}
          <input
            type="text"
            placeholder="…or paste an image URL"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      </div>
      {err && <div className="af-err">{err}</div>}
    </div>
  )
}
