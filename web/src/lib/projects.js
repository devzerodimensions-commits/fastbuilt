import { apiUrl } from './api'

// Categories provided by client
export const CATEGORIES = ['PEB', 'Civil', 'Container Structures', 'Other Works']

// Fallback sample projects (used if the API is unreachable).
// The real data is served from the Node/PostgreSQL backend at /api/projects.
export const SAMPLE_PROJECTS = [
  {
    slug: '400kv-gis-substation',
    name: '400KV GIS Substation',
    category: 'Civil',
    location: 'Bhuj, Gujarat',
    client: 'Power Grid',
    year: '2024',
    status: 'Completed',
    contract_type: 'Turnkey Civil',
    team: 'Fastbuilt Civil Division',
    summary:
      'Complete civil package for a 400KV gas-insulated substation — foundations, control building, cable trenches and site development across a 40-acre plot.',
    image: 'substation',
  },
  {
    slug: 'wind-farm-foundations',
    name: 'Wind Farm Foundation Works',
    category: 'Civil',
    location: 'Kutch, Gujarat',
    client: 'Renewables Developer',
    year: '2024',
    status: 'Completed',
    contract_type: 'Civil & RCC',
    team: 'Fastbuilt Civil Division',
    summary:
      'Reinforced concrete foundations and pedestal works for wind turbine generators, including reinforcement cages and controlled concrete pours.',
    image: 'foundation',
  },
  {
    slug: 'pre-engineered-warehouse',
    name: 'Pre-Engineered Warehouse',
    category: 'PEB',
    location: 'Sanand, Gujarat',
    client: 'Logistics Company',
    year: '2023',
    status: 'Completed',
    contract_type: 'Design & Build PEB',
    team: 'Fastbuilt PEB Division',
    summary:
      'Design, fabrication and erection of a clear-span pre-engineered steel warehouse with insulated roofing and integrated mezzanine.',
    image: 'site-crew',
  },
  {
    slug: 'industrial-peb-shed',
    name: 'Industrial PEB Shed',
    category: 'PEB',
    location: 'Gandhinagar, Gujarat',
    client: 'Manufacturing Unit',
    year: '2023',
    status: 'Completed',
    contract_type: 'Turnkey PEB',
    team: 'Fastbuilt PEB Division',
    summary:
      'Heavy-duty pre-engineered building for a manufacturing facility with crane gantry provision and large roof monitors for ventilation.',
    image: 'substation',
  },
  {
    slug: 'portable-container-office',
    name: 'Portable Container Office',
    category: 'Container Structures',
    location: 'Ahmedabad, Gujarat',
    client: 'Infrastructure Contractor',
    year: '2024',
    status: 'Delivered',
    contract_type: 'Fabrication & Fit-out',
    team: 'Fastbuilt Container Division',
    summary:
      'Modular container-based site offices with insulation, electricals and furnishing — fabricated off-site and delivered ready to use.',
    image: 'foundation',
  },
  {
    slug: 'site-infrastructure-works',
    name: 'Site Infrastructure Works',
    category: 'Other Works',
    location: 'Kutch, Gujarat',
    client: 'EPC Contractor',
    year: '2024',
    status: 'Ongoing',
    contract_type: 'Site Development',
    team: 'Fastbuilt Projects',
    summary:
      'Internal roads, drainage, boundary works and general site infrastructure supporting a large renewable-energy construction site.',
    image: 'site-crew',
  },
]

// A stored image can be a full URL (Cloudinary) or a legacy key -> /images/color/<key>.jpg
const isUrl = (v) => typeof v === 'string' && (/^https?:\/\//.test(v) || v.startsWith('/'))
export function imgColor(key) { return isUrl(key) ? key : `/images/color/${key}.jpg` }
export function imgBW(key) { return isUrl(key) ? key : `/images/bw/${key}.jpg` }
export function imgLQIP(key) { return isUrl(key) ? key : `/images/lqip/${key}.jpg` }

export async function fetchProjects() {
  try {
    const res = await fetch(apiUrl('/api/projects'))
    if (!res.ok) throw new Error('bad status')
    const data = await res.json()
    if (Array.isArray(data) && data.length) return data
    throw new Error('empty')
  } catch {
    return SAMPLE_PROJECTS
  }
}
