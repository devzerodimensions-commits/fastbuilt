CREATE TABLE IF NOT EXISTS projects (
  id             SERIAL PRIMARY KEY,
  slug           TEXT UNIQUE NOT NULL,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,          -- PEB | Civil | Container Structures | Other Works
  location       TEXT,
  client         TEXT,
  year           TEXT,
  status         TEXT,
  contract_type  TEXT,
  team           TEXT,
  summary        TEXT,
  image          TEXT,                   -- full image URL (Cloudinary) OR legacy key
  image2         TEXT,                   -- optional second image (open-view scroll)
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT,
  image       TEXT,                      -- full image URL OR legacy key
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  role        TEXT,
  image       TEXT,                      -- full image URL OR legacy key
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- second image column for older databases that predate it
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image2 TEXT;

-- admin account(s) for the dashboard — password stored hashed, plus reset-token fields
CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT,
  password_hash TEXT NOT NULL,
  role          TEXT DEFAULT 'administrator',
  name          TEXT,
  reset_token   TEXT,
  reset_expires TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'administrator';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS name TEXT;

-- key/value site settings managed from the dashboard Settings page
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT
);
