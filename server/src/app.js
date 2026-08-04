import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import projectsRouter from './routes/projects.js'

dotenv.config()

const app = express()
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }))
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/projects', projectsRouter)

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ error: 'server error' })
})

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, () => console.log(`Fastbuilt API on http://localhost:${PORT}`))
