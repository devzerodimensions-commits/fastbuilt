// Ensures the admin account, roles and site settings exist in the database.
// Runs at server startup (idempotent). Seeds from ADMIN_USER / ADMIN_PASS /
// ADMIN_EMAIL on first boot; thereafter changes persist in the DB.
import { pool } from './db.js'
import { hashPassword } from './auth/password.js'

const SETTINGS_DEFAULTS = {
  site_title: 'Fastbuilt',
  tagline: 'PEB · Civil · Container Structures',
  contact_phone: '8347724798',
  contact_email: 'harshk@fastbuilt.in',
  contact_address: 'Gandhinagar, Gujarat',
  contact_linkedin: 'https://www.linkedin.com/company/fastbuiltenterprise/about/',
  favicon: '/favicon.ico',
}

export async function ensureAdminTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id            SERIAL PRIMARY KEY,
      username      TEXT UNIQUE NOT NULL,
      email         TEXT,
      password_hash TEXT NOT NULL,
      reset_token   TEXT,
      reset_expires TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT now()
    );
  `)
  // roles / display name (added for the WordPress-style Users section)
  await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'administrator'`)
  await pool.query(`ALTER TABLE admins ADD COLUMN IF NOT EXISTS name TEXT`)

  // key/value site settings (managed from the dashboard Settings page)
  await pool.query(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`)
  for (const [k, v] of Object.entries(SETTINGS_DEFAULTS)) {
    await pool.query('INSERT INTO settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING', [k, v])
  }

  const user = process.env.ADMIN_USER || 'admin'
  const pass = process.env.ADMIN_PASS || 'fastbuilt123'
  const email = process.env.ADMIN_EMAIL || null

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM admins')
  if (rows[0].n === 0) {
    await pool.query(
      "INSERT INTO admins (username, email, password_hash, role) VALUES ($1,$2,$3,'administrator')",
      [user, email, hashPassword(pass)]
    )
    console.log('✓ admin account seeded:', user, email ? `(recovery: ${email})` : '(no recovery email set)')
  } else if (email) {
    // keep the recovery email in sync with ADMIN_EMAIL for the primary admin
    await pool.query('UPDATE admins SET email=$1 WHERE lower(username)=lower($2)', [email, user])
  }
}
