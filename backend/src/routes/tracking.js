import { Router } from 'express'
import { validate } from '../middleware/validate.js'
import { jobInputSchema, statusSchema } from '../schemas.js'
import { applicationsController, historyController, jobController, removeSavedJobController, saveJobController, savedJobsController, updateApplicationController } from '../controllers/trackingController.js'

export const trackingRouter = Router()
trackingRouter.get('/jobs/saved', (req, res, next) => savedJobsController(req, res).catch(next))
trackingRouter.post('/jobs/saved', validate(jobInputSchema), (req, res, next) => saveJobController(req, res).catch(next))
trackingRouter.delete('/jobs/saved/:id', (req, res, next) => removeSavedJobController(req, res).catch(next))
trackingRouter.get('/applications', (req, res, next) => applicationsController(req, res).catch(next))
trackingRouter.patch('/applications/:id/status', validate(statusSchema), (req, res, next) => updateApplicationController(req, res).catch(next))
trackingRouter.get('/applications/history', (req, res, next) => historyController(req, res).catch(next))
trackingRouter.get('/jobs/:id', (req, res, next) => jobController(req, res).catch(next))