# Fastbuilt Admin Dashboard

A password-protected dashboard to manage **Projects**, **Workers (Our Workforce)** and **Team**
without touching code. Changes are saved to PostgreSQL and appear on the website automatically.

- Dashboard URL: `/admin/login`  →  `/admin`
- Default login (change before going live): **admin / fastbuilt123**

---

## 1) Run locally (Windows)

Everything is wired for the portable PostgreSQL on port **5434**.

```bat
:: from the project root — starts DB + API + website together
start-all.bat
```

Or manually:

```bash
# 1. start the database (portable pg on 5434)
database\start.bat

# 2. create tables + sample data (first time only)
cd server
npm install
node db/ensure.js      # creates projects / workers / team tables
node db/seed.js        # loads the sample content (optional)
npm start              # API on http://localhost:4000

# 3. website (new terminal)
cd web
npm install
npm run dev            # http://localhost:5173  (proxies /api -> :4000)
```

Open **http://localhost:5173/admin/login**, sign in, and manage content.
Add/edit a project or worker → refresh the site → the change is live.

---

## 2) What is dynamic

| Section | Table | Fields |
|---------|-------|--------|
| Projects | `projects` | name, category, location, client, year, status, contract type, team, summary, image, 2nd image, order |
| Workers  | `workers`  | name, role, photo, order |
| Team     | `team`     | name, role, photo, order |

Images can be a **Cloudinary upload** (see below) or any **image URL** you paste.
Old built-in images still work by their key (e.g. `substation`, `worker1`, `face1`).

---

## 3) Images with Cloudinary (optional, recommended)

1. Create a free account at cloudinary.com.
2. Settings → Upload → add an **unsigned** upload preset.
3. In `web/.env` (create it) add:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_PRESET=your_unsigned_preset
   ```
Now the dashboard shows an **Upload image** button. Without these, you can still paste image URLs.

---

## 4) Deploy live (make the dashboard work on the real site)

The frontend is already deployed as a static site. To make the dashboard work online you also need
the **API + a PostgreSQL database** online.

**a. Database** — create a free PostgreSQL (Neon.tech or Supabase). Copy its `DATABASE_URL`.

**b. API** — deploy the `server/` folder as a Node Web Service (Render):
- Root dir: `server`, Build: `npm install && node db/ensure.js`, Start: `npm start`
- Env vars:
  ```
  DATABASE_URL = <your postgres url>
  ADMIN_USER   = <your admin username>
  ADMIN_PASS   = <a strong password>
  JWT_SECRET   = <a long random string>
  CLIENT_ORIGIN= *
  ```
- After first deploy, run `node db/seed.js` once (Render Shell) if you want the sample content.

**c. Frontend** — in the static site's build env vars set:
  ```
  VITE_API_URL = https://<your-api>.onrender.com
  VITE_CLOUDINARY_CLOUD_NAME = ...   (optional)
  VITE_CLOUDINARY_PRESET     = ...   (optional)
  ```
Redeploy the frontend. The site now reads/writes live data. Done.

> Until the API is deployed, the live site safely falls back to the built-in sample content,
> and `/admin` login simply won't connect — no breakage.
