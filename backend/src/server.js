import http from 'node:http'
import { createApp } from './app.js'
import { config } from './config.js'
import { connectDatabase, disconnectDatabase } from './db.js'
import { logger } from './logger.js'

const app = createApp()
const server = http.createServer(app)
server.requestTimeout = config.REQUEST_TIMEOUT_MS
server.headersTimeout = Math.min(config.REQUEST_TIMEOUT_MS, 30000)
server.keepAliveTimeout = 5000

async function connectWithRetry() {
  for (let attempt = 0; attempt <= config.DB_CONNECT_RETRIES; attempt += 1) {
    try {
      await connectDatabase()
      return
    } catch (error) {
      if (attempt === config.DB_CONNECT_RETRIES) throw error
      const delay = Math.min(1000 * 2 ** attempt, 10000)
      logger.warn({ attempt: attempt + 1, delay, err: error }, 'MongoDB connection failed; retrying')
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

async function start() {
  await connectWithRetry()
  await new Promise((resolve, reject) => {
    const handleError = error => {
      server.off('listening', handleListening)
      reject(error)
    }
    const handleListening = () => {
      server.off('error', handleError)
      logger.info({ port: config.PORT }, 'GetEmployed API listening')
      resolve()
    }
    server.once('error', handleError)
    server.once('listening', handleListening)
    server.listen(config.PORT)
  })
}

let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  logger.info({ signal }, 'shutting down')
  server.close(async () => { await disconnectDatabase(); process.exit(0) })
  server.closeIdleConnections?.()
  setTimeout(() => process.exit(1), config.SHUTDOWN_TIMEOUT_MS).unref()
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)
process.on('uncaughtException', error => { logger.fatal({ err: error }, 'uncaught exception'); shutdown('uncaughtException') })
process.on('unhandledRejection', error => { logger.fatal({ err: error }, 'unhandled rejection'); shutdown('unhandledRejection') })
start().catch(error => {
  if (error.code === 'EADDRINUSE') {
    logger.fatal({ port: config.PORT }, `Port ${config.PORT} is already in use. Stop the existing backend process or configure another PORT.`)
  } else {
    logger.fatal({ err: error }, 'failed to start API')
  }
  process.exit(1)
})