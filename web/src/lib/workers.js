import { apiUrl } from './api'

// Fallback workers (used if the API is unreachable). Real data comes from /api/workers.
export const WORKERS = [
  { name: 'Ramesh Patel', role: 'Senior Mason', image: 'worker1' },
  { name: 'Sita Ben', role: 'Steel Fixer', image: 'worker2' },
  { name: 'Imran Shaikh', role: 'Site Supervisor', image: 'worker3' },
  { name: 'On-site Crew', role: 'Erection Team', image: 'worker4' },
  { name: 'Mahesh Rana', role: 'Shuttering Carpenter', image: 'worker5' },
  { name: 'Dinesh Chauhan', role: 'Concrete Foreman', image: 'worker6' },
]

const isUrl = (v) => typeof v === 'string' && (/^https?:\/\//.test(v) || v.startsWith('/'))
// accepts a full URL, or a legacy key -> /images/workers/<key>.jpg
export function imgWorker(k) { return isUrl(k) ? k : `/images/workers/${k}.jpg` }

export async function fetchWorkers() {
  try {
    const res = await fetch(apiUrl('/api/workers'))
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    if (Array.isArray(data) && data.length) return data
    throw new Error('empty')
  } catch {
    return WORKERS
  }
}
