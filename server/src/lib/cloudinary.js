// Server-side Cloudinary delete (signed). Only active when the API secret is
// configured via env; otherwise deleting media just removes the DB record and
// the file is left orphaned on Cloudinary (logged as a warning).
import crypto from 'node:crypto'

export function cloudinaryDeleteReady() {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
}

export async function destroyCloudinary(publicId) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME
  const key = process.env.CLOUDINARY_API_KEY
  const secret = process.env.CLOUDINARY_API_SECRET
  if (!cloud || !key || !secret) {
    console.warn('[cloudinary] delete skipped (no API secret) for', publicId)
    return false
  }
  const ts = Math.floor(Date.now() / 1000)
  const signature = crypto.createHash('sha1').update(`public_id=${publicId}&timestamp=${ts}${secret}`).digest('hex')
  const form = new URLSearchParams({ public_id: publicId, timestamp: String(ts), api_key: key, signature })
  try {
    const r = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/destroy`, { method: 'POST', body: form })
    const d = await r.json().catch(() => ({}))
    return d.result === 'ok'
  } catch (e) {
    console.error('[cloudinary] destroy failed:', e.message)
    return false
  }
}
