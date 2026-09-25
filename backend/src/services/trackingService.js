import mongoose from 'mongoose'
import { Application } from '../models/Application.js'
import { Job } from '../models/Job.js'
import { SavedJob } from '../models/SavedJob.js'
import { AppError } from '../errors.js'

function publicJob(job) {
  const data = job?.toObject ? job.toObject() : job
  if (!data) return data
  const { _id, createdAt, updatedAt, ...frontendJob } = data
  return frontendJob
}
function publicApplication(application) {
  const data = application.toObject ? application.toObject() : application
  return { ...data, job: publicJob(data.job), id: publicJob(data.job)?.url, savedAt: data.savedAt?.toISOString?.() || data.savedAt, appliedAt: data.appliedAt?.toISOString?.() || data.appliedAt, history: (data.history || []).map(item => ({ ...item, timestamp: item.timestamp?.toISOString?.() || item.timestamp })) }
}

async function findOrCreateJob(input) {
  return Job.findOneAndUpdate({ source: input.source, url: input.url }, { $set: input }, { upsert: true, new: true, setDefaultsOnInsert: true })
}

export async function listSavedJobs(sessionId) {
  const rows = await SavedJob.find({ sessionId }).populate('job').sort({ createdAt: -1 })
  return rows.map(row => publicJob(row.job))
}

export async function saveJob(sessionId, input) {
  const job = await findOrCreateJob(input)
  await SavedJob.updateOne({ sessionId, job: job._id }, { $setOnInsert: { sessionId, job: job._id } }, { upsert: true })
  await Application.updateOne({ sessionId, job: job._id }, { $setOnInsert: { sessionId, job: job._id, status: 'saved', history: [{ action: 'Saved to dashboard' }] } }, { upsert: true })
  return { success: true, id: job.url, job: publicJob(job) }
}

export async function removeSavedJob(sessionId, id) {
  const job = await Job.findOne({ $or: [{ url: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])] })
  if (!job) return { success: true }
  await SavedJob.deleteOne({ sessionId, job: job._id })
  await Application.deleteOne({ sessionId, job: job._id })
  return { success: true }
}

export async function listApplications(sessionId) {
  const rows = await Application.find({ sessionId }).populate('job').sort({ updatedAt: -1 })
  return rows.map(publicApplication)
}

export async function updateApplication(sessionId, id, status, notes) {
  const job = await Job.findOne({ $or: [{ url: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])] })
  if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job was not found.')
  const application = await Application.findOneAndUpdate(
    { sessionId, job: job._id },
    { $setOnInsert: { sessionId, job: job._id, savedAt: new Date(), history: [{ action: 'Saved to dashboard' }] } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
  const now = new Date()
  application.status = status
  if (notes !== undefined) application.notes = notes
  if (status === 'applied' && !application.appliedAt) application.appliedAt = now
  application.history.unshift({ timestamp: now, action: `Status updated to ${status.toUpperCase()}` })
  await application.save()
  return publicApplication(await application.populate('job'))
}

export async function applicationHistory(sessionId) {
  const applications = await Application.find({ sessionId }).populate('job').sort({ updatedAt: -1 })
  return applications.flatMap(application => (application.history || []).map(event => ({
    id: `${application._id}-${event.timestamp.getTime()}`, jobId: application.job._id.toString(), jobTitle: application.job.title, company: application.job.company,
    timestamp: event.timestamp.toISOString(), action: event.action, ...(event.note ? { note: event.note } : {}),
  }))).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

export async function getJob(id) {
  const job = await Job.findOne({ $or: [{ url: id }, ...(mongoose.isValidObjectId(id) ? [{ _id: id }] : [])] })
  if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job was not found.')
  return publicJob(job)
}