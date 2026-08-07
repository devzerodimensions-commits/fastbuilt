import { apiUrl } from './api'

// Fallback team (used if the API is unreachable). Real data comes from /api/team.
export const TEAM = [
  { name: 'Harsh Kapadia', role: 'Founder & CEO', image: 'face1' },
  { name: 'Rajesh Mehta', role: 'Director – Operations', image: 'face2' },
  { name: 'Priya Nair', role: 'Head of Design', image: 'face3' },
  { name: 'Amit Patel', role: 'Project Head – PEB', image: 'face4' },
  { name: 'Sneha Desai', role: 'Structural Engineer', image: 'face5' },
  { name: 'Vikram Singh', role: 'Site Manager', image: 'face6' },
  { name: 'Anjali Rao', role: 'Civil Engineer', image: 'face7' },
  { name: 'Karan Shah', role: 'QA / QC Lead', image: 'face8' },
  { name: 'Meera Iyer', role: 'Procurement Head', image: 'face9' },
  { name: 'Sunil Verma', role: 'Safety Officer', image: 'face10' },
  { name: 'Divya Menon', role: 'Design Engineer', image: 'face11' },
  { name: 'Rohit Joshi', role: 'Erection Lead', image: 'face12' },
  { name: 'Pooja Reddy', role: 'Planning Engineer', image: 'face13' },
  { name: 'Arjun Nanda', role: 'Foreman', image: 'face14' },
  { name: 'Kavita Bhatt', role: 'HR Manager', image: 'face15' },
  { name: 'Manish Gupta', role: 'Accounts Head', image: 'face16' },
  { name: 'Neha Kulkarni', role: 'Site Surveyor', image: 'face17' },
  { name: 'Deepak Yadav', role: 'Fabrication Lead', image: 'face18' },
  { name: 'Ritu Malhotra', role: 'Contracts Manager', image: 'face19' },
  { name: 'Sanjay Pillai', role: 'Estimation Engineer', image: 'face20' },
]

const isUrl = (v) => typeof v === 'string' && (/^https?:\/\//.test(v) || v.startsWith('/'))
// accepts a full URL, or a legacy key -> /images/team/<key>.jpg
export function imgTeam(k) { return isUrl(k) ? k : `/images/team/${k}.jpg` }

export async function fetchTeam() {
  try {
    const res = await fetch(apiUrl('/api/team'))
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    if (Array.isArray(data) && data.length) return data
    throw new Error('empty')
  } catch {
    return TEAM
  }
}
