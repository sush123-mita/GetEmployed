/**
 * App-wide state context.
 * Manages: current view, resume file, upload progress, processing stage,
 * analysis results, saved jobs, application tracking, filters, and errors.
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import { analyzeResume, fetchApplications, fetchSavedJobs, removeSavedJobApi, saveJobApi, updateApplicationNotesApi, updateApplicationStatusApi } from '../api/client'

// ── Views ────────────────────────────────────────────────────
export const VIEWS = {
  LANDING:    'landing',
  UPLOAD:     'upload',
  PROCESSING: 'processing',
  RESULTS:    'results',
  JOB_DETAIL: 'job_detail',
  SAVED:      'saved',
}

// ── Application Status Options ────────────────────────────────
export const APPLICATION_STATUS = {
  SAVED:        'saved',
  APPLIED:      'applied',
  INTERVIEWING: 'interviewing',
  OFFER:        'offer',
  ARCHIVED:     'archived',
}

// ── Processing stages ─────────────────────────────────────────
export const STAGES = [
  { id: 'reading',   label: 'Reading resume',           detail: 'Parsing document structure and text content' },
  { id: 'skills',    label: 'Extracting skills & ATS',   detail: 'Identifying competencies, experience, and ATS score' },
  { id: 'searching', label: 'Searching live listings',   detail: 'Querying real-time job APIs for open roles' },
  { id: 'ranking',   label: 'Ranking match relevance',   detail: 'Scoring openings against your specific profile' },
]

// ── Reducer ───────────────────────────────────────────────────
const initialState = {
  view:            VIEWS.LANDING,
  resumeFile:      null,
  uploadProgress:  0,
  processingStage: 0,   // index into STAGES
  results:         null, // AnalysisResult
  selectedJob:     null, // Job
  savedJobs:       [],   // Job[] (kept in sync for backward compatibility)
  applications:    [],   // Application[]
  sortBy:          'matchScore', // 'matchScore' | 'date' | 'location'
  filterSource:    'all',        // 'all' | 'Adzuna' | 'Jooble'
  filterLevel:     'all',        // 'all' | 'entry' | 'mid' | 'senior' | 'lead'
  filterWorkMode:  'all',        // 'all' | 'remote' | 'hybrid' | 'on-site'
  filterMinScore:  0,            // 0 | 30 | 50 | 70
  searchQuery:     '',
  error:           null,
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.payload, error: null }

    case 'SET_RESUME':
      return { ...state, resumeFile: action.payload, error: null }

    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload }

    case 'SET_STAGE':
      return { ...state, processingStage: action.payload }

    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload,
        view: VIEWS.RESULTS,
        error: null,
        processingStage: 0,
      }

    case 'SET_TRACKING':
      return { ...state, savedJobs: action.payload.savedJobs, applications: action.payload.applications }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        view: action.returnTo ?? state.view,
        processingStage: 0,
      }

    case 'SELECT_JOB':
      return { ...state, selectedJob: action.payload, view: VIEWS.JOB_DETAIL }

    case 'BACK_TO_RESULTS':
      return { ...state, view: VIEWS.RESULTS, selectedJob: null }

    case 'TOGGLE_SAVE_JOB': {
      const job = action.payload
      const exists = state.savedJobs.some(j => j.url === job.url)
      const nowIso = new Date().toISOString()

      if (exists) {
        return {
          ...state,
          savedJobs: state.savedJobs.filter(j => j.url !== job.url),
          applications: state.applications.filter(a => a.id !== job.url),
        }
      } else {
        const newApp = {
          id: job.url,
          job,
          status: APPLICATION_STATUS.SAVED,
          savedAt: nowIso,
          notes: '',
          history: [
            { timestamp: nowIso, action: 'Saved to dashboard' }
          ]
        }
        return {
          ...state,
          savedJobs: [job, ...state.savedJobs],
          applications: [newApp, ...state.applications],
        }
      }
    }

    case 'UPDATE_APPLICATION_STATUS': {
      const { jobUrl, status, note } = action.payload
      const nowIso = new Date().toISOString()

      const updatedApps = state.applications.map(app => {
        if (app.id !== jobUrl) return app

        const newHistoryItem = {
          timestamp: nowIso,
          action: `Status updated to ${status.toUpperCase()}`,
          note: note || undefined,
        }

        return {
          ...app,
          status,
          appliedAt: status === APPLICATION_STATUS.APPLIED && !app.appliedAt ? nowIso : app.appliedAt,
          history: [newHistoryItem, ...(app.history || [])],
        }
      })

      return {
        ...state,
        applications: updatedApps,
      }
    }

    case 'UPDATE_APPLICATION_NOTES': {
      const { jobUrl, notes } = action.payload
      return {
        ...state,
        applications: state.applications.map(app =>
          app.id === jobUrl ? { ...app, notes } : app
        ),
      }
    }

    case 'CLEAR_ALL_SAVED':
      return {
        ...state,
        savedJobs: [],
        applications: [],
      }

    case 'SET_SORT':
      return { ...state, sortBy: action.payload }

    case 'SET_FILTER_SOURCE':
      return { ...state, filterSource: action.payload }

    case 'SET_FILTER_LEVEL':
      return { ...state, filterLevel: action.payload }

    case 'SET_FILTER_WORK_MODE':
      return { ...state, filterWorkMode: action.payload }

    case 'SET_FILTER_MIN_SCORE':
      return { ...state, filterMinScore: action.payload }

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload }

    case 'RESET':
      return {
        ...initialState,
        savedJobs: state.savedJobs, // Keep saved jobs across new analyses within session
        applications: state.applications,
      }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const abortControllerRef = useRef(null)
  const timersRef = useRef([])

  useEffect(() => {
    let active = true
    Promise.all([fetchSavedJobs(), fetchApplications()])
      .then(([savedJobs, applications]) => {
        if (active) dispatch({ type: 'SET_TRACKING', payload: { savedJobs, applications } })
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  /** Navigate to a view */
  const navigate = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), [])

  /** Cancel active analysis */
  const cancelAnalysis = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    dispatch({ type: 'SET_VIEW', payload: VIEWS.UPLOAD })
  }, [])

  /** Start the full analysis pipeline */
  const startAnalysis = useCallback(async (file) => {
    if (!file) return

    dispatch({ type: 'SET_RESUME', payload: file })
    dispatch({ type: 'SET_VIEW', payload: VIEWS.PROCESSING })
    dispatch({ type: 'SET_STAGE', payload: 0 })

    // Cancel any previous requests/timers
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    abortControllerRef.current = new AbortController()

    // Staged animation — UI progress indicators while request is in-flight
    STAGES.forEach((_, i) => {
      if (i === 0) return
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_STAGE', payload: i })
      }, i * 3200)
      timersRef.current.push(timer)
    })

    try {
      const result = await analyzeResume(
        file,
        (evt) => {
          if (evt.total) {
            dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: Math.round((evt.loaded / evt.total) * 100) })
          }
        },
        abortControllerRef.current.signal
      )

      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      abortControllerRef.current = null
      dispatch({ type: 'SET_RESULTS', payload: result })
    } catch (err) {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      abortControllerRef.current = null

      if (err.name === 'CanceledError' || err.code === 'CANCELLED') {
        dispatch({ type: 'SET_VIEW', payload: VIEWS.UPLOAD })
        return
      }

      dispatch({
        type: 'SET_ERROR',
        payload: {
          message: err.message || 'Something went wrong. Please check backend connection.',
          code: err.code || 'UNKNOWN',
          status: err.status || 0,
        },
        returnTo: VIEWS.UPLOAD,
      })
    }
  }, [])

  /** Toggle saved state for a job */
  const toggleSaveJob = useCallback(async (job) => {
    const saved = state.savedJobs.some(item => item.url === job.url)
    if (saved) await removeSavedJobApi(job.url)
    else await saveJobApi(job)
    dispatch({ type: 'TOGGLE_SAVE_JOB', payload: job })
  }, [state.savedJobs])

  /** Check if a job is saved */
  const isJobSaved = useCallback((job) => {
    if (!job?.url) return false
    return state.savedJobs.some(j => j.url === job.url)
  }, [state.savedJobs])

  /** Get application tracking record for a job */
  const getApplication = useCallback((jobUrl) => {
    return state.applications.find(a => a.id === jobUrl) || null
  }, [state.applications])

  /** Update an application's status */
  const updateApplicationStatus = useCallback(async (jobUrl, status, note = '') => {
    const current = state.applications.find(application => application.id === jobUrl)
    await updateApplicationStatusApi(jobUrl, status, note || current?.notes || '')
    dispatch({ type: 'UPDATE_APPLICATION_STATUS', payload: { jobUrl, status, note } })
  }, [state.applications])

  /** Update notes for a tracked application */
  const updateApplicationNotes = useCallback(async (jobUrl, notes) => {
    const current = state.applications.find(application => application.id === jobUrl)
    await updateApplicationNotesApi(jobUrl, current?.status || APPLICATION_STATUS.SAVED, notes)
    dispatch({ type: 'UPDATE_APPLICATION_NOTES', payload: { jobUrl, notes } })
  }, [state.applications])

  /** Clear all saved jobs and tracked applications */
  const clearAllSaved = useCallback(async () => {
    await Promise.all(state.savedJobs.map(job => removeSavedJobApi(job.url)))
    dispatch({ type: 'CLEAR_ALL_SAVED' })
  }, [state.savedJobs])

  /** Select a job for detail view */
  const selectJob = useCallback((job) => {
    dispatch({ type: 'SELECT_JOB', payload: job })
  }, [])

  const backToResults = useCallback(() => dispatch({ type: 'BACK_TO_RESULTS' }), [])
  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  const value = {
    ...state,
    navigate,
    startAnalysis,
    cancelAnalysis,
    toggleSaveJob,
    isJobSaved,
    getApplication,
    updateApplicationStatus,
    updateApplicationNotes,
    clearAllSaved,
    selectJob,
    backToResults,
    reset,
    dispatch,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within <AppProvider>')
  return ctx
}
