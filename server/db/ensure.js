import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../src/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function ensure() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('✓ schema ensured')
  await pool.end()
}

ensure().catch((e) => {
  console.error('ensure failed:', e.message)
  process.exit(1)
})
