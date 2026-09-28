const mongoose = require('mongoose')

const activityLogSchema = new mongoose.Schema({
  type:        { type: String, required: true },
  message:     { type: String, required: true },
  severity: {
    type: String,
    enum: ['critical','high','medium','low','resolved'],
    default: 'low',
  },
  entity_type: { type: String },
  entity_id:   { type: mongoose.Schema.Types.ObjectId },
  user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

activityLogSchema.index({ createdAt: -1 })

module.exports = mongoose.model('ActivityLog', activityLogSchema)
