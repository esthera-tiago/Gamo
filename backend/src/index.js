import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import levelsRoutes from './routes/levels.js'
import progressRoutes from './routes/progress.js'
import scoresRoutes from './routes/scores.js'

const app = express()
const PORT = process.env.PORT || 3000

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean)

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}))

app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/levels', levelsRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/scores', scoresRoutes)

app.listen(PORT, () => {
  console.log(`Gamo backend running on port ${PORT}`)
})
