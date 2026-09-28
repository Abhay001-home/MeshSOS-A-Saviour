const router   = require('express').Router()
const Incident = require('../models/Incident')
const { authenticate, requireCoordinator } = require('../middleware/auth')
const { logActivity } = require('../utils/activity')

const PRIORITY_ORDER = { critical: 1, high: 2, medium: 3, low: 4 }

// GET /api/incidents
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, priority, type, limit = 100, offset = 0 } = req.query
    const filter = {}
    if (status   && status   !== 'all') filter.status   = status
    if (priority && priority !== 'all') filter.priority = priority
    if (type     && type     !== 'all') filter.type     = type

    const incidents = await Incident.find(filter)
      .populate('reported_by', 'name email')
      .populate('assigned_team', 'name status')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean()

    // Sort by priority then date
    incidents.sort((a, b) =>
      (PRIORITY_ORDER[a.priority] || 5) - (PRIORITY_ORDER[b.priority] || 5) ||
      new Date(b.createdAt) - new Date(a.createdAt)
    )

    const total = await Incident.countDocuments(filter)
    res.json({ incidents, total })
  } catch (err) { next(err) }
})

// GET /api/incidents/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('reported_by', 'name email')
      .populate('assigned_team', 'name status leader_name')
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    res.json(incident)
  } catch (err) { next(err) }
})

// POST /api/incidents
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      title, type = 'Other', priority = 'medium', status = 'active',
      description, latitude, longitude, address, affected_count = 0,
    } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    const incident = await Incident.create({
      title, type, priority, status, description,
      latitude, longitude, address, affected_count,
      reported_by: req.user._id,
    })

    await logActivity('incident', `New ${priority} incident: ${title}`, priority, 'incident', incident._id, req.user._id)
    req.app.get('io')?.emit('incident:created', incident)
    res.status(201).json(incident)
  } catch (err) { next(err) }
})

// PATCH /api/incidents/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = ['title','type','priority','status','description','latitude','longitude','address','affected_count','assigned_team']
    const updates = {}
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    }
    if (!Object.keys(updates).length)
      return res.status(400).json({ message: 'No fields to update' })

    const incident = await Incident.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    ).populate('assigned_team', 'name')
    if (!incident) return res.status(404).json({ message: 'Incident not found' })

    req.app.get('io')?.emit('incident:updated', incident)
    res.json(incident)
  } catch (err) { next(err) }
})

// DELETE /api/incidents/:id
router.delete('/:id', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id)
    if (!incident) return res.status(404).json({ message: 'Incident not found' })
    req.app.get('io')?.emit('incident:deleted', { id: req.params.id })
    res.json({ message: 'Incident deleted', id: req.params.id })
  } catch (err) { next(err) }
})

// PATCH /api/incidents/:id/status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body
    if (!status) return res.status(400).json({ message: 'Status required' })
    const incident = await Incident.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    )
    if (!incident) return res.status(404).json({ message: 'Not found' })
    req.app.get('io')?.emit('incident:updated', incident)
    res.json(incident)
  } catch (err) { next(err) }
})

// POST /api/incidents/:id/assign
router.post('/:id/assign', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const { team_id } = req.body
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { assigned_team: team_id, status: 'in_progress' },
      { new: true }
    ).populate('assigned_team', 'name')
    if (!incident) return res.status(404).json({ message: 'Not found' })

    await logActivity('incident', `Team assigned to: ${incident.title}`, 'medium', 'incident', incident._id, req.user._id)
    req.app.get('io')?.emit('incident:updated', incident)
    res.json(incident)
  } catch (err) { next(err) }
})

module.exports = router
