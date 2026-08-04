import pg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pg

export const pool = new Pool({
  host: process.env.PGHOST || '127.0.0.1',
  port: Number(process.env.PGPORT || 5434),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'fastbuilt',
  database: process.env.PGDATABASE || 'fastbuilt',
})

export const query = (text, params) => pool.query(text, params)
