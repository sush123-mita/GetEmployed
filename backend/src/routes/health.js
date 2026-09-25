import { Router } from 'express'
import { checkDatabaseHealth } from '../db.js'
import { checkPythonHealth } from '../services/pythonClient.js'

export const healthRouter = Router()
healthRouter.get('/live', (req, res) => res.json({ service: 'getemployed-api', status: 'ok' }))
healthRouter.get(['/ready', '/'], async (req, res) => {
  const database = await checkDatabaseHealth()
  const automation = await checkPythonHealth()
  const healthy = database.status === 'up' && automation.status === 'up'
  res.status(healthy ? 200 : 503).json({ service: 'getemployed-api', status: healthy ? 'ok' : 'degraded', database: database.status, automation })
})