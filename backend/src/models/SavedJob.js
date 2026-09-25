import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  sessionId: { type: String, required: true }, job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
}, { timestamps: true, versionKey: false })
schema.index({ sessionId: 1, job: 1 }, { unique: true })
export const SavedJob = mongoose.model('SavedJob', schema)