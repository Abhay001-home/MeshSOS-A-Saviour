const router = require('express').Router()
const User   = require('../models/User')
const { authenticate, requireAdmin } = require('../middleware/auth')

// GET /api/users
router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean()
    res.json({ users, total: users.length })
  } catch (err) { next(err) }
})

// GET /api/users/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id)
      return res.status(403).json({ message: 'Forbidden' })
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) { next(err) }
})

// POST /api/users  (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, email, password, role = 'responder' } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' })
    const user = await User.create({ name, email, password, role })
    res.status(201).json(user)
  } catch (err) { next(err) }
})

// PATCH /api/users/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const isSelf  = req.user._id.toString() === req.params.id
    const isAdmin = req.user.role === 'admin'
    if (!isSelf && !isAdmin)
      return res.status(403).json({ message: 'Forbidden' })

    const user = await User.findById(req.params.id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (req.body.name)     user.name  = req.body.name
    if (req.body.email)    user.email = req.body.email
    if (req.body.password) user.password = req.body.password   // pre-save hook rehashes
    if (isAdmin && req.body.role   !== undefined) user.role   = req.body.role
    if (isAdmin && req.body.active !== undefined) user.active = req.body.active

    await user.save()
    res.json(user)
  } catch (err) { next(err) }
})

// DELETE /api/users/:id  (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res.status(400).json({ message: 'Cannot delete your own account' })
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ message: 'User deleted', id: req.params.id })
  } catch (err) { next(err) }
})

module.exports = router
