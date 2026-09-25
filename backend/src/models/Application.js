import mongoose from 'mongoose'

const historySchema = new mongoose.Schema({ timestamp: { type: Date, default: Date.now }, action: String, note: String }, { _id: false })
const schema = new mongoose.Schema({
  sessionId: { type: String, required: true }, job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: { type: String, enum: ['saved', 'applied', 'interviewing', 'offer', 'archived'], default: 'saved' }, savedAt: { type: Date, default: Date.now }, appliedAt: Date,
  notes: { type: String, maxlength: 2000, default: '' }, history: { type: [historySchema], default: [] },
}, { timestamps: true, versionKey: false })
schema.index({ sessionId: 1, job: 1 }, { unique: true })
schema.index({ sessionId: 1, status: 1 })
export const Application = mongoose.model('Application', schema)