require('dotenv').config()
const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const jwt        = require('jsonwebtoken')
const mongoose   = require('mongoose')

const connectDB  = require('./config/db')
const { errorHandler, notFound } = require('./middleware/errorHandler')

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth')
const incidentRoutes  = require('./routes/incidents')
const survivorRoutes  = require('./routes/survivors')
const teamRoutes      = require('./routes/teams')
const resourceRoutes  = require('./routes/resources')
const userRoutes      = require('./routes/users')
const dashboardRoutes = require('./routes/dashboard')

const app    = express()
const server = http.createServer(app)

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods:     ['GET','POST','PATCH','DELETE'],
    credentials: true,
  },
  transports: ['websocket','polling'],
})

app.set('io', io)

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next()   // allow anon in dev
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hyperrescue_secret')
    socket.userId = decoded.userId
    next()
  } catch {
    process.env.NODE_ENV === 'production' ? next(new Error('Unauthorized')) : next()
  }
})

io.on('connection', (socket) => {
  console.log(`  [WS] +connected  ${socket.id} (user: ${socket.userId || 'anon'})`)

  socket.on('join:incident',  (id) => socket.join(`incident:${id}`))
  socket.on('leave:incident', (id) => socket.leave(`incident:${id}`))

  // Mobile / BLE mesh GPS ping
  socket.on('team:ping', async ({ teamId, lat, lng }) => {
    if (!teamId || lat == null || lng == null) return
    try {
      const Team = require('./models/Team')
      await Team.findByIdAndUpdate(teamId, { latitude: lat, longitude: lng })
      io.emit('team:location', { teamId, lat, lng })
    } catch (err) {
      console.warn('[WS] team:ping error:', err.message)
    }
  })

  socket.on('disconnect', () => {
    console.log(`  [WS] -disconnect ${socket.id}`)
  })
})

// ── Express middleware ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/survivors', survivorRoutes)
app.use('/api/teams',     teamRoutes)
app.use('/api/resources', resourceRoutes)
app.use('/api/users',     userRoutes)
app.use('/api/dashboard', dashboardRoutes)

// Health check
app.get('/health', async (req, res) => {
  const dbState = ['disconnected','connected','connecting','disconnecting']
  res.json({
    status:    'ok',
    service:   'HyperRescue API',
    version:   '1.0.0',
    db:        dbState[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  })
})

app.get('/', (req, res) => {
  res.json({ message: 'HyperRescue API v1.0 — Hyperlocal Disaster Response Coordinator (MongoDB)' })
})

// ── Error handlers ─────────────────────────────────────────────────────────────
app.use(notFound)
app.use(errorHandler)

// ── Boot ───────────────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT) || 5000

const start = async () => {
  await connectDB()
  server.listen(PORT, () => {
    console.log('')
    console.log('  ⬡  HyperRescue API — MongoDB Edition')
    console.log(`  🚀 Server   → http://localhost:${PORT}`)
    console.log(`  🍃 Database → ${process.env.MONGO_URI}`)
    console.log(`  🌐 CORS     → ${process.env.CORS_ORIGIN}`)
    console.log(`  🔌 Sockets  → ready`)
    console.log('')
  })
}

start()

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[SIGTERM] Closing mongoose connection...')
  await mongoose.connection.close()
  server.close(() => process.exit(0))
})

module.exports = { app, server, io }
