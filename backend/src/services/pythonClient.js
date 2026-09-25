import axios from 'axios'
import FormData from 'form-data'
import path from 'node:path'
import { config } from '../config.js'
import { AppError } from '../errors.js'

export async function analyzeWithPython(file, logger) {
  let lastError

  for (let attempt = 0; attempt <= config.PYTHON_RETRIES; attempt += 1) {
    try {
      const form = new FormData()
      form.append('resume', file.buffer, { filename: path.basename(file.originalname), contentType: file.mimetype })
      const response = await axios.post(`${config.PYTHON_SERVICE_URL}${config.PYTHON_ANALYZE_PATH}`, form, {
        headers: form.getHeaders(), timeout: config.PYTHON_TIMEOUT_MS, maxContentLength: 2 * 1024 * 1024, maxBodyLength: file.size + 1024 * 1024,
      })
      return response.data
    } catch (error) {
      lastError = error
      const retryable = !error.response || error.code === 'ECONNABORTED' || error.response.status >= 500
      if (!retryable || attempt === config.PYTHON_RETRIES) break
      logger.warn({ attempt: attempt + 1, code: error.code }, 'retrying Python analysis request')
    }
  }

  if (lastError?.code === 'ECONNABORTED') throw new AppError(504, 'AI_TIMEOUT', 'Resume analysis timed out. Please try again.')
  throw new AppError(503, 'AI_UNAVAILABLE', 'Resume analysis is temporarily unavailable. Please try again later.')
}

export async function checkPythonHealth() {
  try {
    await axios.get(`${config.PYTHON_SERVICE_URL}/health`, { timeout: 3000, maxContentLength: 16 * 1024 })
    return { status: 'up' }
  } catch {
    return { status: 'down' }
  }
}