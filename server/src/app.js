import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectsRouter from './routes/projects.js'
import authRouter from './routes/auth.js'
import peopleCrud from './routes/peopleCrud.js'
import categoriesRouter from './routes/categories.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/workers', peopleCrud('workers'))
app.use('/api/team', peopleCrud('team'))
app.use('/api/categories', categoriesRouter)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'server error' })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`Fastbuilt API on http://localhost:${PORT}`))
