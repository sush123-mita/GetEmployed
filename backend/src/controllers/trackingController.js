import { getJob, listSavedJobs, saveJob, removeSavedJob, listApplications, updateApplication, applicationHistory } from '../services/trackingService.js'

export async function savedJobsController(req, res) { res.json(await listSavedJobs(req.sessionId)) }
export async function saveJobController(req, res) { res.status(201).json(await saveJob(req.sessionId, req.body)) }
export async function removeSavedJobController(req, res) { res.json(await removeSavedJob(req.sessionId, decodeURIComponent(req.params.id))) }
export async function applicationsController(req, res) { res.json(await listApplications(req.sessionId)) }
export async function updateApplicationController(req, res) { res.json(await updateApplication(req.sessionId, decodeURIComponent(req.params.id), req.body.status, req.body.notes)) }
export async function historyController(req, res) { res.json(await applicationHistory(req.sessionId)) }
export async function jobController(req, res) { res.json(await getJob(decodeURIComponent(req.params.id))) }