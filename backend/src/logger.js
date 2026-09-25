import pino from 'pino'
import { config } from './config.js'

export const logger = pino({
	level: config.LOG_LEVEL,
	base: null,
	redact: ['req.headers.authorization', 'req.headers.cookie'],
})