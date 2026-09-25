import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import { config } from './config.js'
import { logger } from './logger.js'
import { sessionMiddleware } from './middleware/session.js'
import { resumeRouter } from './routes/resume.js'
import { trackingRouter } from './routes/tracking.js'
import { healthRouter } from './routes/health.js'
import { errorHandler, notFoundHandler } from './errors.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.set('trust proxy', config.TRUST_PROXY)
  app.use(helmet())
  app.use(cors({ origin: (origin, callback) => !origin || config.frontendOrigins.includes(origin) ? callback(null, true) : callback(new Error('Origin not allowed')), credentials: true }))
  app.use(pinoHttp({ logger }))
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser(config.SESSION_SECRET))
  app.use(rateLimit({ windowMs: config.RATE_LIMIT_WINDOW_MS, limit: config.RATE_LIMIT_MAX, standardHeaders: 'draft-8', legacyHeaders: false, skip: req => req.originalUrl.startsWith('/api/health') }))
  app.use(sessionMiddleware)
  app.use('/api/health', healthRouter)
  app.use('/api/resume', rateLimit({ windowMs: config.RATE_LIMIT_WINDOW_MS, limit: config.UPLOAD_RATE_LIMIT_MAX, standardHeaders: 'draft-8', legacyHeaders: false }), resumeRouter)
  app.use('/api', trackingRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}