const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const JWT_SECRET = process.env.JWT_SECRET || 'hyperrescue_secret'

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    if (!user || !user.active) {
      return res.status(401).json({ message: 'User not found or inactive' })
    }
    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return res.status(403).json({ message: 'Insufficient permissions' })
  }
  next()
}

const requireAdmin       = requireRole('admin')
const requireCoordinator = requireRole('admin', 'coordinator')

const signToken = (userId) =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

module.exports = { authenticate, requireRole, requireAdmin, requireCoordinator, signToken }
