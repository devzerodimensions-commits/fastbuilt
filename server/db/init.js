// Deploy-time init: ensure the schema exists, and seed sample content ONLY when a
// table is empty (so redeploys never wipe content the admin added via the dashboard).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const PROJECTS = [
  { slug: '400kv-gis-substation', name: '400KV GIS Substation', category: 'Civil', location: 'Bhuj, Gujarat', client: 'Power Grid', year: '2024', status: 'Completed', contract_type: 'Turnkey Civil', team: 'Fastbuilt Civil Division', summary: 'Complete civil package for a 400KV gas-insulated substation — foundations, control building, cable trenches and site development across a 40-acre plot.', image: 'substation' },
  { slug: 'wind-farm-foundations', name: 'Wind Farm Foundation Works', category: 'Civil', location: 'Kutch, Gujarat', client: 'Renewables Developer', year: '2024', status: 'Completed', contract_type: 'Civil & RCC', team: 'Fastbuilt Civil Division', summary: 'Reinforced concrete foundations and pedestal works for wind turbine generators, including reinforcement cages and controlled concrete pours.', image: 'foundation' },
  { slug: 'pre-engineered-warehouse', name: 'Pre-Engineered Warehouse', category: 'PEB', location: 'Sanand, Gujarat', client: 'Logistics Company', year: '2023', status: 'Completed', contract_type: 'Design & Build PEB', team: 'Fastbuilt PEB Division', summary: 'Design, fabrication and erection of a clear-span pre-engineered steel warehouse with insulated roofing and integrated mezzanine.', image: 'site-crew' },
  { slug: 'industrial-peb-shed', name: 'Industrial PEB Shed', category: 'PEB', location: 'Gandhinagar, Gujarat', client: 'Manufacturing Unit', year: '2023', status: 'Completed', contract_type: 'Turnkey PEB', team: 'Fastbuilt PEB Division', summary: 'Heavy-duty pre-engineered building for a manufacturing facility with crane gantry provision and large roof monitors for ventilation.', image: 'substation' },
  { slug: 'portable-container-office', name: 'Portable Container Office', category: 'Container Structures', location: 'Ahmedabad, Gujarat', client: 'Infrastructure Contractor', year: '2024', status: 'Delivered', contract_type: 'Fabrication & Fit-out', team: 'Fastbuilt Container Division', summary: 'Modular container-based site offices with insulation, electricals and furnishing — fabricated off-site and delivered ready to use.', image: 'foundation' },
  { slug: 'site-infrastructure-works', name: 'Site Infrastructure Works', category: 'Other Works', location: 'Kutch, Gujarat', client: 'EPC Contractor', year: '2024', status: 'Ongoing', contract_type: 'Site Development', team: 'Fastbuilt Projects', summary: 'Internal roads, drainage, boundary works and general site infrastructure supporting a large renewable-energy construction site.', image: 'site-crew' },
]
const WORKERS = [
  { name: 'Ramesh Patel', role: 'Senior Mason', image: 'worker1' },
  { name: 'Sita Ben', role: 'Steel Fixer', image: 'worker2' },
  { name: 'Imran Shaikh', role: 'Site Supervisor', image: 'worker3' },
  { name: 'On-site Crew', role: 'Erection Team', image: 'worker4' },
  { name: 'Mahesh Rana', role: 'Shuttering Carpenter', image: 'worker5' },
  { name: 'Dinesh Chauhan', role: 'Concrete Foreman', image: 'worker6' },
]
const TEAM = [
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

async function seedIfEmpty(table, rows, insert) {
  const { rows: c } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table}`)
  if (c[0].n > 0) { console.log(`• ${table}: ${c[0].n} rows, skip seed`); return }
  let order = 0
  for (const r of rows) await insert(r, order++)
  console.log(`✓ seeded ${rows.length} ${table}`)
}

async function init() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✓ schema ensured')

  await seedIfEmpty('projects', PROJECTS, (p, o) =>
    pool.query(
      `INSERT INTO projects (slug, name, category, location, client, year, status, contract_type, team, summary, image, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [p.slug, p.name, p.category, p.location, p.client, p.year, p.status, p.contract_type, p.team, p.summary, p.image, o]
    ))
  await seedIfEmpty('workers', WORKERS, (w, o) =>
    pool.query('INSERT INTO workers (name, role, image, sort_order) VALUES ($1,$2,$3,$4)', [w.name, w.role, w.image, o]))
  await seedIfEmpty('team', TEAM, (t, o) =>
    pool.query('INSERT INTO team (name, role, image, sort_order) VALUES ($1,$2,$3,$4)', [t.name, t.role, t.image, o]))

  await pool.end()
  console.log('✓ init complete')
}

init().catch((e) => { console.error('init failed:', e.message); process.exit(1) })
