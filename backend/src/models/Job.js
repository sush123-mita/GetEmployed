import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, company: { type: String, required: true, trim: true }, location: { type: String, default: '' },
  url: { type: String, required: true, trim: true }, source: { type: String, required: true, trim: true }, matchScore: { type: Number, min: 0, max: 100 },
  matchedSkills: { type: [String], default: [] }, missingSkills: { type: [String], default: [] }, workMode: String, employmentType: String,
  description: { type: String, default: '' }, requirements: { type: [String], default: [] }, responsibilities: { type: [String], default: [] },
  matchExplanation: String, matchReasons: { type: [String], default: [] }, postedDate: Date, salary: String,
}, { timestamps: true, versionKey: false })

jobSchema.index({ source: 1, url: 1 }, { unique: true })
export const Job = mongoose.model('Job', jobSchema)