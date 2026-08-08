// Ensures the single-admin account exists in the database. Runs at server startup
// (idempotent) so the login/reset flow always has a row to work with, even on the
// manually-created Render service. Seeds from ADMIN_USER / ADMIN_PASS / ADMIN_EMAIL
// on first boot, then password changes persist in the DB (env can't change at runtime).
import { pool } from './db.js'
import { hashPassword } from './auth/password.js'

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

  const user = process.env.ADMIN_USER || 'admin'
  const pass = process.env.ADMIN_PASS || 'fastbuilt123'
  const email = process.env.ADMIN_EMAIL || null

  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM admins')
  if (rows[0].n === 0) {
    await pool.query(
      'INSERT INTO admins (username, email, password_hash) VALUES ($1,$2,$3)',
      [user, email, hashPassword(pass)]
    )
    console.log('✓ admin account seeded:', user, email ? `(recovery: ${email})` : '(no recovery email set)')
  } else if (email) {
    // keep the recovery email in sync with ADMIN_EMAIL (so setting/changing it in
    // Render takes effect on the next deploy without touching the DB by hand)
    await pool.query('UPDATE admins SET email=$1 WHERE lower(username)=lower($2)', [email, user])
  }
}
