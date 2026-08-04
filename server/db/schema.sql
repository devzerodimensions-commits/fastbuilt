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
  image          TEXT,                   -- image key -> /images/color/<key>.jpg & /images/bw/<key>.jpg
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);
