const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  type:        { type: String, default: 'Other', trim: true },
  status: {
    type: String,
    enum: ['available','allocated','depleted','maintenance'],
    default: 'available',
  },
  quantity:    { type: Number, default: 1, min: 0 },
  unit:        { type: String, default: 'units', trim: true },
  location:    { type: String, trim: true },
  assigned_to: { type: String, trim: true },
  notes:       { type: String, trim: true },
  incident:    { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  team:        { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  created_by:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

resourceSchema.set('toJSON', { virtuals: true })
resourceSchema.index({ status: 1 })
resourceSchema.index({ type: 1 })

module.exports = mongoose.model('Resource', resourceSchema)
