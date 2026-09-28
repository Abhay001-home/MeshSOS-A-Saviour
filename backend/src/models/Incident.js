const mongoose = require('mongoose')

const incidentSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  type:           { type: String, default: 'Other', trim: true },
  priority: {
    type: String,
    enum: ['critical','high','medium','low'],
    default: 'medium',
  },
  status: {
    type: String,
    enum: ['active','in_progress','pending','resolved','closed'],
    default: 'active',
  },
  description:     { type: String, trim: true },
  latitude:        { type: Number },
  longitude:       { type: Number },
  address:         { type: String, trim: true },
  affected_count:  { type: Number, default: 0, min: 0 },
  assigned_team:   { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  reported_by:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

// Virtual for frontend compat: expose id as string
incidentSchema.set('toJSON', { virtuals: true })

// Indexes for common query patterns
incidentSchema.index({ status: 1 })
incidentSchema.index({ priority: 1 })
incidentSchema.index({ createdAt: -1 })
incidentSchema.index({ latitude: 1, longitude: 1 })

module.exports = mongoose.model('Incident', incidentSchema)
