import mongoose from 'mongoose'
import { config } from './config.js'
import { logger } from './logger.js'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  mongoose.connection.on('error', error => logger.error({ err: error }, 'MongoDB connection error'))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))
  await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 5000, maxPoolSize: 20, minPoolSize: 2, autoIndex: !config.isProduction })
  logger.info('MongoDB connected')
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}

export function databaseStatus() {
  return mongoose.connection.readyState === 1 ? 'up' : 'down'
}

export async function checkDatabaseHealth() {
  if (databaseStatus() !== 'up') return { status: 'down' }
  try {
    await mongoose.connection.db.command({ ping: 1 })
    return { status: 'up' }
  } catch {
    return { status: 'down' }
  }
}