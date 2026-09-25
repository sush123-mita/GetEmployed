import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true }, profile: { type: mongoose.Schema.Types.ObjectId, ref: 'CandidateProfile', required: true },
  jobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }], totalFound: { type: Number, default: 0 },
}, { timestamps: true, versionKey: false })
schema.index({ sessionId: 1, createdAt: -1 })
export const ResumeAnalysis = mongoose.model('ResumeAnalysis', schema)