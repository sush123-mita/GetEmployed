import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true, index: true }, detectedSkills: { type: [String], default: [] }, role: String, experienceLevel: String,
  totalYearsExperience: Number, summary: String, experience: { type: [mongoose.Schema.Types.Mixed], default: [] }, education: { type: [mongoose.Schema.Types.Mixed], default: [] },
  projects: { type: [mongoose.Schema.Types.Mixed], default: [] }, certifications: { type: [String], default: [] }, domains: { type: [String], default: [] },
  strengths: { type: [String], default: [] }, ats: mongoose.Schema.Types.Mixed,
}, { timestamps: true, versionKey: false })

export const CandidateProfile = mongoose.model('CandidateProfile', profileSchema)