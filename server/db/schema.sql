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
