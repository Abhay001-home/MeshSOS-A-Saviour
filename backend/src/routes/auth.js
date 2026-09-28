const router = require('express').Router()
const User   = require('../models/User')
const { authenticate, signToken } = require('../middleware/auth')

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'responder' } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' })
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' })

    const user  = await User.create({ name, email, password, role })
    const token = signToken(user._id)
    res.status(201).json({ token, user })
  } catch (err) { next(err) }
})

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' })

    const user = await User.findOne({ email: email.toLowerCase().trim(), active: true }).select('+password')
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' })

    user.last_login = new Date()
    await user.save({ validateBeforeSave: false })

    const token = signToken(user._id)
    res.json({ token, user })
  } catch (err) { next(err) }
})

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user })
})

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
  res.json({ message: 'Logged out successfully' })
})

module.exports = router
