import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

// In production (Render / Neon / Supabase) a single DATABASE_URL is provided.
// Locally we fall back to the portable PostgreSQL on port 5434.
export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST || '127.0.0.1',
      port: Number(process.env.PGPORT || 5434),
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'fastbuilt',
      database: process.env.PGDATABASE || 'fastbuilt',
    })

export const query = (text, params) => pool.query(text, params)
