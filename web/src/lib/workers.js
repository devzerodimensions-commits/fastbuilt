import { apiUrl } from './api'
import { WORKFORCE_PHOTOS } from './workforcePhotos'

// The real workforce photos (bundled WebP) are the base set.
export const WORKERS = WORKFORCE_PHOTOS

const isUrl = (v) => typeof v === 'string' && (/^https?:\/\//.test(v) || v.startsWith('/'))
// accepts a full URL / path, or a legacy key -> /images/workers/<key>.jpg
export function imgWorker(k) { return isUrl(k) ? k : `/images/workers/${k}.jpg` }

// Pool = bundled real photos + real dashboard-added workers (Cloudinary URLs).
// Legacy sample rows (plain keys like "worker1") are excluded.
export async function fetchWorkers() {
  try {
    const res = await fetch(apiUrl('/api/workers'))
    const data = res.ok ? await res.json() : []
    const db = Array.isArray(data) ? data.filter((x) => x && x.image && /^https?:\/\//.test(x.image)) : []
    const seen = new Set(WORKFORCE_PHOTOS.map((p) => p.image))
    return [...WORKFORCE_PHOTOS, ...db.filter((x) => !seen.has(x.image))]
  } catch {
    return WORKFORCE_PHOTOS
  }
}
