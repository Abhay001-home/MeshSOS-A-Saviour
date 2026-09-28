const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message)

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field'
    return res.status(409).json({ message: `${field} already exists` })
  }
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message)
    return res.status(400).json({ message: messages.join(', ') })
  }
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' })
  }
  if (err.status) {
    return res.status(err.status).json({ message: err.message })
  }
  res.status(500).json({ message: 'Internal server error' })
}

const notFound = (req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` })
}

module.exports = { errorHandler, notFound }
