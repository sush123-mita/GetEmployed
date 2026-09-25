/**
 * GetEmployed – API Client & Service Layer
 *
 * All API calls go through this module to the Node/Express backend only.
 * Frontend never calls Python, Adzuna, Jooble, or AI providers directly.
 *
 * Architecture:
 *   Frontend (Vite/React)
 *     ↓ HTTP / JSON / multipart
 *   Node.js / Express API Gateway (Port 3001)
 *     ↓ HTTP / JSON
 *   Python / FastAPI Automation Service (Port 8000)
 *     ↓ External Job APIs (Adzuna, Jooble) & LLM
 *
 * Configure the base URL via VITE_API_BASE_URL env variable.
 * Defaults to /api (proxied to http://localhost:3001 in dev by Vite).
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 90_000, // 90s – resume parsing + LLM + job search can take time
  withCredentials: true,
})

// ── Request interceptor ──────────────────────────────────────
client.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error),
)

// ── Response interceptor ─────────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(new ApiError('Request was cancelled.', 'CANCELLED', 0))
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new ApiError('Request timed out. Please try again.', 'TIMEOUT', 408))
    }
    if (!error.response) {
      return Promise.reject(new ApiError('Cannot connect to backend server. Make sure the Node API is running on port 3001.', 'NETWORK_ERROR', 0))
    }
    const { status, data } = error.response
    const message = data?.error || data?.detail || data?.message || `Server error (${status})`
    return Promise.reject(new ApiError(message, data?.code || 'SERVER_ERROR', status))
  },
)

/** Structured API error for consistent error handling in UI */
export class ApiError extends Error {
  constructor(message, code, status) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

// ── Core Analysis API ────────────────────────────────────────

/**
 * Analyze a resume file.
 * Sends multipart/form-data to POST /api/resume/analyze
 *
 * @param {File} file - PDF or DOCX file
 * @param {function} [onUploadProgress] - optional upload progress callback
 * @param {AbortSignal} [signal] - optional abort signal to cancel request
 * @returns {Promise<AnalysisResult>}
 */
export async function analyzeResume(file, onUploadProgress, signal) {
  const formData = new FormData()
  formData.append('resume', file)

  const response = await client.post('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
    signal,
  })

  return response.data
}

/**
 * Check health of backend + automation service.
 * GET /api/health
 * @returns {Promise<HealthStatus>}
 */
export async function checkHealth() {
  const response = await client.get('/health')
  return response.data
}

// ── Saved Jobs & Application Tracking API Placeholders ───────
// Clean API contracts ready for Node/Express + Database implementation.

/**
 * Fetch list of saved jobs for current user/session.
 * GET /api/jobs/saved
 * @returns {Promise<Job[]>}
 */
export async function fetchSavedJobs() {
  try {
    const response = await client.get('/jobs/saved')
    return response.data
  } catch (err) {
    // If backend endpoint is not yet wired, rethrow or allow fallback
    throw err
  }
}

/**
 * Save a job.
 * POST /api/jobs/saved
 * @param {Job} job
 * @returns {Promise<{ success: boolean, id: string }>}
 */
export async function saveJobApi(job) {
  const response = await client.post('/jobs/saved', job)
  return response.data
}

/**
 * Remove a saved job.
 * DELETE /api/jobs/saved/:id
 * @param {string} jobId
 * @returns {Promise<{ success: boolean }>}
 */
export async function removeSavedJobApi(jobId) {
  const response = await client.delete(`/jobs/saved/${encodeURIComponent(jobId)}`)
  return response.data
}

/**
 * Fetch tracked applications.
 * GET /api/applications
 * @returns {Promise<Application[]>}
 */
export async function fetchApplications() {
  const response = await client.get('/applications')
  return response.data
}

/**
 * Update application status.
 * PATCH /api/applications/:id/status
 * @param {string} applicationId
 * @param {'saved' | 'applied' | 'interviewing' | 'offer' | 'archived'} status
 * @param {string} [notes]
 * @returns {Promise<Application>}
 */
export async function updateApplicationStatusApi(applicationId, status, notes = '') {
  const response = await client.patch(`/applications/${encodeURIComponent(applicationId)}/status`, {
    status,
    notes,
  })
  return response.data
}

export async function updateApplicationNotesApi(applicationId, status, notes) {
  const response = await client.patch(`/applications/${encodeURIComponent(applicationId)}/status`, { status, notes })
  return response.data
}

/**
 * Fetch application timeline / activity history.
 * GET /api/applications/history
 * @returns {Promise<ApplicationHistoryEvent[]>}
 */
export async function fetchApplicationHistoryApi() {
  const response = await client.get('/applications/history')
  return response.data
}

/**
 * Fetch individual job details.
 * GET /api/jobs/:id
 * @param {string} jobId
 * @returns {Promise<Job>}
 */
export async function fetchJobDetailsApi(jobId) {
  const response = await client.get(`/jobs/${encodeURIComponent(jobId)}`)
  return response.data
}

// ── Type definitions (JSDoc contracts) ───────────────────────

/**
 * @typedef {Object} AtsBreakdown
 * @property {number} formatting - Score 0-100 for ATS layout readability
 * @property {number} keywords - Score 0-100 for industry keyword match
 * @property {number} contactInfo - Score 0-100 for email/phone/links detection
 * @property {number} sectionStructure - Score 0-100 for standard headers (Experience, Education, Skills)
 * @property {string[]} suggestions - Actionable tips to improve ATS compatibility
 * @property {string[]} [strengths] - What the resume does well for ATS systems
 */

/**
 * @typedef {Object} AtsData
 * @property {number} score - Overall ATS compatibility score (0-100)
 * @property {'A' | 'B' | 'C' | 'D' | 'F'} [grade] - Overall ATS grade
 * @property {string} [readability] - e.g. 'High', 'Moderate', 'Needs optimization'
 * @property {AtsBreakdown} [breakdown]
 * @property {string[]} [suggestions]
 */

/**
 * @typedef {Object} ExperienceItem
 * @property {string} role
 * @property {string} company
 * @property {string} [duration]
 * @property {string} [description]
 * @property {string[]} [highlights]
 */

/**
 * @typedef {Object} EducationItem
 * @property {string} degree
 * @property {string} institution
 * @property {string} [year]
 */

/**
 * @typedef {Object} ProjectItem
 * @property {string} name
 * @property {string} [description]
 * @property {string[]} [technologies]
 * @property {string} [url]
 */

/**
 * @typedef {Object} CandidateProfileData
 * @property {string[]} detectedSkills
 * @property {string}   role
 * @property {string}   experienceLevel
 * @property {number}   [totalYearsExperience]
 * @property {string}   [summary]
 * @property {ExperienceItem[]} [experience]
 * @property {EducationItem[]}  [education]
 * @property {ProjectItem[]}    [projects]
 * @property {string[]} [certifications]
 * @property {string[]} [domains]
 * @property {string[]} [strengths]
 * @property {AtsData}  [ats]
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string[]} detectedSkills
 * @property {string}   role
 * @property {string}   experienceLevel
 * @property {Job[]}    jobs
 * @property {number}   totalFound
 * @property {AtsData}  [ats]
 * @property {CandidateProfileData} [profile]
 */

/**
 * @typedef {Object} Job
 * @property {string}   title
 * @property {string}   company
 * @property {string}   location
 * @property {string}   url
 * @property {string}   source - e.g. 'Adzuna' | 'Jooble'
 * @property {number}   matchScore - 0 to 100
 * @property {string[]} matchedSkills
 * @property {string[]} [missingSkills]
 * @property {string}   [workMode] - 'remote' | 'hybrid' | 'on-site'
 * @property {string}   [employmentType] - 'full-time' | 'part-time' | 'contract'
 * @property {string}   description
 * @property {string[]} [requirements]
 * @property {string[]} [responsibilities]
 * @property {string}   [matchExplanation]
 * @property {string[]} [matchReasons]
 * @property {string}   postedDate
 * @property {string}   [salary]
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {Job} job
 * @property {'saved' | 'applied' | 'interviewing' | 'offer' | 'archived'} status
 * @property {string} savedAt
 * @property {string} [appliedAt]
 * @property {string} [notes]
 * @property {Array<{ timestamp: string, action: string, note?: string }>} history
 */

/**
 * @typedef {Object} ApplicationHistoryEvent
 * @property {string} id
 * @property {string} jobId
 * @property {string} jobTitle
 * @property {string} company
 * @property {string} timestamp
 * @property {string} action
 * @property {string} [note]
 */

/**
 * @typedef {Object} HealthStatus
 * @property {string} service
 * @property {string} status
 * @property {Object} [automation]
 */
