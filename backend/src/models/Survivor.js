const mongoose = require('mongoose')

const survivorSchema = new mongoose.Schema({
  name:               { type: String, trim: true },
  age:                { type: Number, min: 0, max: 150 },
  gender:             { type: String, enum: ['male','female','other','unknown'], default: 'unknown' },
  status: {
    type: String,
    enum: ['missing','found','critical','rescued','deceased'],
    default: 'missing',
  },
  medical_condition: {
    type: String,
    enum: ['stable','serious','critical','unknown'],
    default: 'unknown',
  },
  needs:              { type: String, default: 'None', trim: true },
  latitude:           { type: Number },
  longitude:          { type: Number },
  address:            { type: String, trim: true },
  contact_name:       { type: String, trim: true },
  contact_phone:      { type: String, trim: true },
  notes:              { type: String, trim: true },
  incident:           { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
  reported_by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

survivorSchema.set('toJSON', { virtuals: true })
survivorSchema.index({ status: 1 })
survivorSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Survivor', survivorSchema)
