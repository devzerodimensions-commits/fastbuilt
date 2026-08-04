# Fastbuilt — Portfolio Website

A big.dk-style portfolio site for **Fastbuilt Enterprise** (PEB · Civil · Container Structures · Other Works), Gandhinagar, Gujarat.

- **Frontend:** React + Vite + React Router (`web/`)
- **Backend:** Node.js + Express (`server/`)
- **Database:** PostgreSQL (portable instance in `database/`, port 5434)
- **Font:** Geist (client-provided, in `web/public/fonts/`)

## Key features
- Minimal header with slide-down full-screen menu
- Vertical project list on the home page; hover reveals a **black & white** thumbnail
- Category filters: PEB, Civil, Container Structures, Other Works
- Click a project → **horizontal-scroll** project page (mouse wheel scrolls sideways)
- Project images fade from **black & white → colour** as they scroll into view
- Spec fields per project: Project Location, Client, Year Completed, Project Status, Contract Type, Team
- Footer with contact details + LinkedIn

## Run everything (Windows)
```
start-all.bat
```
Then open **http://localhost:5192**

## Run manually
```
# 1. Database
database\start.bat

# 2. API  (first time: set up schema + seed)
cd server
npm install
npm run ensure
npm run seed
npm start           # http://localhost:4000

# 3. Frontend
cd web
npm install
npm run dev -- --port 5192   # http://localhost:5192
```

## Contact (in code)
- Phone: 8347724798
- Email: harshk@fastbuilt.in
- Address: Gandhinagar, Gujarat
- LinkedIn: https://www.linkedin.com/company/fastbuiltenterprise/about/

## Adding / editing projects
Projects live in PostgreSQL (`projects` table). Edit `server/db/seed.js` and run `npm run seed`,
or insert rows directly. Each project references an image **key** — put
`<key>.jpg` in both `web/public/images/color/` and `web/public/images/bw/`.

> Current project data is sample/placeholder. Replace with real project info + photos when provided.
