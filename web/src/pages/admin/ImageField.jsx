import { useRef, useState } from 'react'
import { uploadImageFull, createMedia, cloudinaryConfigured } from '../../lib/api'
import { imgColor } from '../../lib/projects'

// Convert ANY chosen image to optimized WebP (resized) before uploading — so every
// image stored is WebP, now and in the future.
async function fileToWebp(file, maxDim = 1400, quality = 0.85) {
  const dataUrl = await new Promise((res, rej) => {
    const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file)
  })
  const img = await new Promise((res, rej) => {
    const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = dataUrl
  })
  let { width, height } = img
  if (Math.max(width, height) > maxDim) {
    const s = maxDim / Math.max(width, height)
    width = Math.round(width * s); height = Math.round(height * s)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width; canvas.height = height
  canvas.getContext('2d').drawImage(img, 0, 0, width, height)
  const blob = await new Promise((res) => canvas.toBlob(res, 'image/webp', quality))
  if (!blob) throw new Error('WebP conversion not supported by this browser')
  return new File([blob], (file.name.replace(/\.[^.]+$/, '') || 'image') + '.webp', { type: 'image/webp' })
}

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
      const webp = await fileToWebp(file)      // always upload as WebP
      const up = await uploadImageFull(webp)
      onChange(up.secure_url)
      // best-effort: also register in the Media Library so every upload shows up there
      createMedia({ url: up.secure_url, public_id: up.public_id, filename: file.name, format: up.format, width: up.width, height: up.height, bytes: up.bytes }).catch(() => {})
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
