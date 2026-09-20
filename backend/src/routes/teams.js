const router = require('express').Router()
const Team   = require('../models/Team')
const Incident = require('../models/Incident')
const { authenticate, requireCoordinator } = require('../middleware/auth')
const { logActivity } = require('../utils/activity')

// GET /api/teams
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query
    const filter = {}
    if (status && status !== 'all') filter.status = status

    const teams = await Team.find(filter)
      .populate('created_by', 'name')
      .sort({ status: 1, name: 1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .lean()

    res.json({ teams, total: teams.length })
  } catch (err) { next(err) }
})

// GET /api/teams/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id).populate('created_by', 'name')
    if (!team) return res.status(404).json({ message: 'Team not found' })

    const active_incidents = await Incident.find({
      assigned_team: req.params.id,
      status: { $nin: ['resolved', 'closed'] },
    }).select('title priority status').lean()

    res.json({ ...team.toJSON(), active_incidents })
  } catch (err) { next(err) }
})

// POST /api/teams
router.post('/', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const {
      name, type = 'Search & Rescue', status = 'available',
      leader_name, leader_phone, member_count = 4,
      latitude, longitude, base_location, notes,
    } = req.body
    if (!name) return res.status(400).json({ message: 'Team name is required' })

    const team = await Team.create({
      name, type, status, leader_name, leader_phone, member_count,
      latitude, longitude, base_location, notes,
      created_by: req.user._id,
    })

    await logActivity('team', `Team created: ${name}`, 'low', 'team', team._id, req.user._id)
    req.app.get('io')?.emit('team:status', team)
    res.status(201).json(team)
  } catch (err) { next(err) }
})

// PATCH /api/teams/:id
router.patch('/:id', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const allowed = ['name','type','status','leader_name','leader_phone','member_count','latitude','longitude','base_location','notes']
    const updates = {}
    for (const f of allowed) {
      if (req.body[f] !== undefined) updates[f] = req.body[f]
    }
    if (!Object.keys(updates).length)
      return res.status(400).json({ message: 'No fields to update' })

    const team = await Team.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    )
    if (!team) return res.status(404).json({ message: 'Team not found' })
    req.app.get('io')?.emit('team:status', team)
    res.json(team)
  } catch (err) { next(err) }
})

// DELETE /api/teams/:id
router.delete('/:id', authenticate, requireCoordinator, async (req, res, next) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id)
    if (!team) return res.status(404).json({ message: 'Team not found' })
    res.json({ message: 'Team deleted', id: req.params.id })
  } catch (err) { next(err) }
})

// PATCH /api/teams/:id/location  — live GPS push from mobile/BLE
router.patch('/:id/location', authenticate, async (req, res, next) => {
  try {
    const { lat, lng, latitude, longitude } = req.body
    const finalLat = lat ?? latitude
    const finalLng = lng ?? longitude
    if (finalLat == null || finalLng == null)
      return res.status(400).json({ message: 'lat and lng are required' })

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { latitude: finalLat, longitude: finalLng },
      { new: true }
    ).select('name latitude longitude status')
    if (!team) return res.status(404).json({ message: 'Team not found' })

    req.app.get('io')?.emit('team:location', {
      teamId: req.params.id,
      lat: finalLat,
      lng: finalLng,
      name: team.name,
      status: team.status,
    })
    res.json(team)
  } catch (err) { next(err) }
})

module.exports = router
