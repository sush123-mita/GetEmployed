import { fileTypeFromBuffer } from 'file-type'
import { CandidateProfile } from '../models/CandidateProfile.js'
import { Job } from '../models/Job.js'
import { ResumeAnalysis } from '../models/ResumeAnalysis.js'
import { AppError } from '../errors.js'
import { analyzeWithPython } from './pythonClient.js'
import { jobInputSchema } from '../schemas.js'
import { z } from 'zod'

const analysisSchema = z.object({
  detectedSkills: z.array(z.string()).default([]), role: z.string().default(''), experienceLevel: z.string().default(''), totalFound: z.number().int().nonnegative().optional(),
  ats: z.record(z.unknown()).optional(), profile: z.record(z.unknown()).optional(), jobs: z.array(z.record(z.unknown())).max(500),
}).passthrough()

function toJobInput(job) {
  const result = jobInputSchema.safeParse({
    ...job, location: job.location || '', source: job.source || 'unknown', description: job.description || '',
    matchedSkills: job.matchedSkills || [], missingSkills: job.missingSkills || job.missingRequirements || [], requirements: job.requirements || [],
    responsibilities: job.responsibilities || [], matchReasons: job.matchReasons || [],
  })
  if (!result.success) return null
  return result.data
}

async function persistJob(job) {
  const update = { ...job, postedDate: job.postedDate || undefined }
  return Job.findOneAndUpdate({ source: update.source, url: update.url }, { $set: update }, { upsert: true, new: true, setDefaultsOnInsert: true })
}

function publicJob(job) {
  const data = job.toObject ? job.toObject() : job
  const { _id, createdAt, updatedAt, ...frontendJob } = data
  return frontendJob
}

export async function analyzeResume({ file, sessionId, logger }) {
  const detectedType = await fileTypeFromBuffer(file.buffer)
  const valid = (file.mimetype === 'application/pdf' && detectedType?.mime === 'application/pdf') ||
    (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' && detectedType?.mime === 'application/zip')
  if (!valid) throw new AppError(400, 'INVALID_FILE', 'The uploaded file is not a valid PDF or DOCX document.')

  const raw = await analyzeWithPython(file, logger)
  const parsed = analysisSchema.safeParse(raw)
  if (!parsed.success) throw new AppError(502, 'INVALID_AI_RESPONSE', 'The analysis service returned an invalid response.')

  const data = parsed.data
  const profileData = { sessionId, ...(data.profile || {}), detectedSkills: data.detectedSkills, role: data.role, experienceLevel: data.experienceLevel, ats: data.ats }
  const profile = await CandidateProfile.findOneAndUpdate({ sessionId }, { $set: profileData }, { upsert: true, new: true, setDefaultsOnInsert: true })
  const validJobs = data.jobs.map(toJobInput).filter(Boolean)
  const jobs = await Promise.all(validJobs.map(persistJob))
  await ResumeAnalysis.create({ sessionId, profile: profile._id, jobs: jobs.map(job => job._id), totalFound: data.totalFound ?? jobs.length })

  return { ...data, profile: { ...data.profile, detectedSkills: data.detectedSkills, role: data.role, experienceLevel: data.experienceLevel, ats: data.ats }, jobs: jobs.map(publicJob), totalFound: data.totalFound ?? jobs.length }
}