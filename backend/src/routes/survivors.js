const router   = require('express').Router()
const Survivor = require('../models/Survivor')
const { authenticate } = require('../middleware/auth')
const { logActivity } = require('../utils/activity')

// GET /api/survivors
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, incident_id, limit = 200, offset = 0 } = req.query
    const filter = {}
    if (status      && status !== 'all') filter.status   = status
    if (incident_id)                     filter.incident = incident_id

    const STATUS_ORDER = { critical: 1, missing: 2, found: 3, rescued: 4, deceased: 5 }
    const survivors = await Survivor.find(filter)
      .populate('reported_by', 'name')
      .populate('incident', 'title')
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean()

    survivors.sort((a, b) =>
      (STATUS_ORDER[a.status] || 9) - (STATUS_ORDER[b.status] || 9)
    )

    res.json({ survivors, total: survivors.length })
  } catch (err) { next(err) }
})

// GET /api/survivors/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const sv = await Survivor.findById(req.params.id)
      .populate('reported_by', 'name')
      .populate('incident', 'title')
    if (!sv) return res.status(404).json({ message: 'Survivor not found' })
    res.json(sv)
  } catch (err) { next(err) }
})

// POST /api/survivors
router.post('/', authenticate, async (req, res, next) => {
  try {
    const {
      name, age, gender = 'unknown', status = 'missing',
      medical_condition = 'unknown', needs = 'None',
      latitude, longitude, address,
      contact_name, contact_phone, notes, incident_id,
    } = req.body

    const sv = await Survivor.create({
      name, age, gender, status, medical_condition, needs,
      latitude, longitude, address, contact_name, contact_phone, notes,
      incident:    incident_id || undefined,
      reported_by: req.user._id,
    })

    const severity = status === 'critical' ? 'critical' : status === 'missing' ? 'high' : 'medium'
    await logActivity('survivor', `Survivor logged: ${name || 'Unknown'} (${status})`, severity, 'survivor', sv._id, req.user._id)
    req.app.get('io')?.emit('survivor:added', sv)
    res.status(201).json(sv)
  } catch (err) { next(err) }
})

// PATCH /api/survivors/:id
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const allowed = ['name','age','gender','status','medical_condition','needs','latitude','longitude','address','contact_name','contact_phone','notes','incident']
    const updates = {}
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    }
    if (req.body.incident_id !== undefined) updates.incident = req.body.incident_id

    if (!Object.keys(updates).length)
      return res.status(400).json({ message: 'No fields to update' })

    const sv = await Survivor.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    )
    if (!sv) return res.status(404).json({ message: 'Not found' })
    req.app.get('io')?.emit('survivor:updated', sv)
    res.json(sv)
  } catch (err) { next(err) }
})

// PATCH /api/survivors/:id/status
router.patch('/:id/status', authenticate, async (req, res, next) => {
  try {
    const { status } = req.body
    const sv = await Survivor.findByIdAndUpdate(
      req.params.id, { status }, { new: true, runValidators: true }
    )
    if (!sv) return res.status(404).json({ message: 'Not found' })
    req.app.get('io')?.emit('survivor:updated', sv)
    res.json(sv)
  } catch (err) { next(err) }
})

module.exports = router
