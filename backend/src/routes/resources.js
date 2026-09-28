const router   = require('express').Router()
const Resource = require('../models/Resource')
const { authenticate, requireCoordinator } = require('../middleware/auth')
const { logActivity } = require('../utils/activity')

// GET /api/resources
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, incident_id, limit = 200, offset = 0 } = req.query
    const filter = {}
    if (status      && status !== 'all') filter.status  = status
    if (type        && type   !== 'all') filter.type    = type
    if (incident_id)                     filter.incident = incident_id

    const resources = await Resource.find(filter)
      .populate('created_by', 'name')
      .sort({ type: 1, name: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean()

    res.json({ resources, total: resources.length })
  } catch (err) { next(err) }
})

// GET /api/resources/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('created_by', 'name')
      .populate('incident', 'title')
      .populate('team', 'name')
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json(resource)
  } catch (err) { next(err) }
})

// POST /api/resources
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      name, type = 'Other', status = 'available',
      quantity = 1, unit = 'units', location, notes,
      assigned_to, incident_id, team_id,
    } = req.body
    if (!name) return res.status(400).json({ message: 'Resource name is required' })

    const resource = await Resource.create({
      name, type, status, quantity, unit, location, notes, assigned_to,
      incident:   incident_id || undefined,
      team:       team_id     || undefined,
      created_by: req.user._id,
    })

    await logActivity('resource', `Resource added: ${name} (${quantity} ${unit})`, 'low', 'resource', resource._id, req.user._id)
    res.status(201).json(resource)
  } catch (err) { next(err) }
})

// PATCH /api/resources/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = ['name','type','status','quantity','unit','location','notes','assigned_to','incident','team']
    const updates = {}
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    }
    if (req.body.incident_id !== undefined) updates.incident = req.body.incident_id
    if (req.body.team_id     !== undefined) updates.team     = req.body.team_id

    if (!Object.keys(updates).length)
      return res.status(400).json({ message: 'No fields to update' })

    const resource = await Resource.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    )
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json(resource)
  } catch (err) { next(err) }
})

// DELETE /api/resources/:id
router.delete('/:id', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id)
    if (!resource) return res.status(404).json({ message: 'Resource not found' })
    res.json({ message: 'Resource deleted', id: req.params.id })
  } catch (err) { next(err) }
})

// POST /api/resources/:id/allocate
router.post('/:id/allocate', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const { incident_id, team_id, quantity } = req.body
    const updates = { status: 'allocated' }
    if (incident_id)            updates.incident = incident_id
    if (team_id)                updates.team     = team_id
    if (quantity !== undefined) updates.quantity = quantity

    const resource = await Resource.findByIdAndUpdate(
      req.params.id, updates, { new: true }
    )
    if (!resource) return res.status(404).json({ message: 'Resource not found' })

    await logActivity('resource', `Resource allocated: ${resource.name}`, 'medium', 'resource', resource._id, req.user._id)
    res.json(resource)
  } catch (err) { next(err) }
})

module.exports = router
