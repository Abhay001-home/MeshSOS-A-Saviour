const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  type:          { type: String, default: 'Search & Rescue', trim: true },
  status: {
    type: String,
    enum: ['available','deployed','standby','offline'],
    default: 'available',
  },
  leader_name:   { type: String, trim: true },
  leader_phone:  { type: String, trim: true },
  member_count:  { type: Number, default: 4, min: 0 },
  latitude:      { type: Number },
  longitude:     { type: Number },
  base_location: { type: String, trim: true },
  notes:         { type: String, trim: true },
  created_by:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

teamSchema.set('toJSON', { virtuals: true })
teamSchema.index({ status: 1 })

module.exports = mongoose.model('Team', teamSchema)
