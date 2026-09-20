const ActivityLog = require('../models/ActivityLog')

async function logActivity(type, message, severity = 'low', entityType, entityId, userId) {
  try {
    await ActivityLog.create({
      type,
      message,
      severity,
      entity_type: entityType || undefined,
      entity_id:   entityId   || undefined,
      user:        userId     || undefined,
    })
  } catch (err) {
    console.warn('[logActivity] Failed:', err.message)
  }
}

module.exports = { logActivity }
