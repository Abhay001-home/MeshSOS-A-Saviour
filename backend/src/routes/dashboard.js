const router      = require('express').Router()
const Incident    = require('../models/Incident')
const Survivor    = require('../models/Survivor')
const Team        = require('../models/Team')
const Resource    = require('../models/Resource')
const ActivityLog = require('../models/ActivityLog')
const { authenticate } = require('../middleware/auth')

// GET /api/dashboard/stats
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const [
      activeIncidents,
      survivorsFound,
      survivorsRescued,
      survivorsCritical,
      teamsDeployed,
      teamsAvailable,
      resourcesDeployed,
      incidentsResolved,
    ] = await Promise.all([
      Incident.countDocuments({ status: { $nin: ['resolved','closed'] } }),
      Survivor.countDocuments({ status: { $in: ['found','critical','missing'] } }),
      Survivor.countDocuments({ status: 'rescued' }),
      Survivor.countDocuments({ status: 'critical' }),
      Team.countDocuments({ status: 'deployed' }),
      Team.countDocuments({ status: 'available' }),
      Resource.countDocuments({ status: 'allocated' }),
      Incident.countDocuments({
        status: { $in: ['resolved','closed'] },
        updatedAt: { $gte: new Date(Date.now() - 86400000) },
      }),
    ])

    // Average response time (resolved incidents in last 7 days)
    const resolved = await Incident.find({
      status: { $in: ['resolved','closed'] },
      createdAt: { $gte: new Date(Date.now() - 7 * 86400000) },
    }).select('createdAt updatedAt').lean()

    const avgMs = resolved.length
      ? resolved.reduce((s, i) => s + (new Date(i.updatedAt) - new Date(i.createdAt)), 0) / resolved.length
      : 0
    const avg_response_min = parseFloat((avgMs / 60000).toFixed(1))

    res.json({
      active_incidents:   activeIncidents,
      survivors_found:    survivorsFound,
      survivors_rescued:  survivorsRescued,
      survivors_critical: survivorsCritical,
      teams_deployed:     teamsDeployed,
      teams_available:    teamsAvailable,
      resources_deployed: resourcesDeployed,
      incidents_resolved: incidentsResolved,
      avg_response_min,
      coverage_area_km2:  24.5,
      timestamp:          new Date().toISOString(),
    })
  } catch (err) { next(err) }
})

// GET /api/dashboard/activity
router.get('/activity', authenticate, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query
    const activity = await ActivityLog.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean()

    // Normalize to frontend shape
    const normalized = activity.map(a => ({
      id:       a._id,
      type:     a.type,
      message:  a.message,
      severity: a.severity,
      ts:       a.createdAt,
      user:     a.user?.name,
    }))
    res.json(normalized)
  } catch (err) { next(err) }
})

// POST /api/dashboard/broadcast
router.post('/broadcast', authenticate, async (req, res, next) => {
  try {
    const { message, severity = 'high' } = req.body
    if (!message) return res.status(400).json({ message: 'Message is required' })

    const alert = {
      id:        Date.now(),
      message,
      severity,
      sender:    req.user.name,
      timestamp: new Date().toISOString(),
    }

    req.app.get('io')?.emit('alert:broadcast', alert)

    await ActivityLog.create({
      type: 'alert',
      message: `BROADCAST: ${message}`,
      severity,
      user: req.user._id,
    })

    res.json({ ok: true, alert })
  } catch (err) { next(err) }
})

module.exports = router
