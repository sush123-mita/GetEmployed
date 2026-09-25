import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Calendar, ExternalLink, Bookmark, BookmarkCheck,
  Building2, CheckCircle2, AlertCircle, Laptop, Clock, Briefcase,
  FileText, CheckSquare, MessageSquare, ChevronRight
} from 'lucide-react'
import { useApp, APPLICATION_STATUS } from '../context/AppContext'
import styles from './JobDetailPage.module.css'

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch { return null }
}

function getScoreClass(score) {
  if (score >= 60) return 'score-ring--high'
  if (score >= 30) return 'score-ring--medium'
  return 'score-ring--low'
}

function detectWorkMode(job) {
  if (job.workMode) return job.workMode
  const text = `${job.title} ${job.location} ${job.description}`.toLowerCase()
  if (text.includes('remote') || text.includes('work from home')) return 'Remote'
  if (text.includes('hybrid')) return 'Hybrid'
  if (text.includes('on-site') || text.includes('onsite') || text.includes('in-office')) return 'On-site'
  return null
}

export default function JobDetailPage() {
  const {
    selectedJob: job,
    backToResults,
    toggleSaveJob,
    isJobSaved,
    getApplication,
    updateApplicationStatus,
    updateApplicationNotes,
  } = useApp()

  const [notesInput, setNotesInput] = useState('')
  const [showNotesForm, setShowNotesForm] = useState(false)

  if (!job) return null

  const saved = isJobSaved(job)
  const appRecord = getApplication(job.url)
  const score = Math.round(job.matchScore ?? 0)
  const dateLabel = formatDate(job.postedDate)
  const workMode = detectWorkMode(job)

  // Matching details
  const matchedSkills = job.matchedSkills || []
  const missingRequirements = job.missingSkills || job.missingRequirements || []
  const matchReasons = job.matchReasons || (job.matchExplanation ? [job.matchExplanation] : [])
  const responsibilities = Array.isArray(job.responsibilities) ? job.responsibilities : []
  const requirements = Array.isArray(job.requirements) ? job.requirements : []

  const handleStatusChange = async (newStatus) => {
    if (!saved) {
      await toggleSaveJob(job)
    }
    await updateApplicationStatus(job.url, newStatus)
  }

  const handleSaveNotes = async (e) => {
    e.preventDefault()
    if (!saved) {
      await toggleSaveJob(job)
    }
    await updateApplicationNotes(job.url, notesInput)
    setShowNotesForm(false)
  }

  return (
    <motion.div
      className={styles.page}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`container ${styles.inner}`}>
        {/* ── Back button ─────────────────────────────────── */}
        <button
          className={`btn btn--ghost btn--sm ${styles.backBtn}`}
          onClick={backToResults}
          id="back-to-results-btn"
        >
          <ArrowLeft size={15} />
          Back to recommendations
        </button>

        <div className={styles.layout}>
          {/* ── Main column ──────────────────────────────── */}
          <main className={styles.main}>
            {/* Header Card */}
            <div className={`card ${styles.headerCard}`}>
              <div className={styles.headerTop}>
                <div className={styles.companyIcon} aria-hidden="true">
                  <Building2 size={24} strokeWidth={1.5} />
                </div>
                <div className={styles.headerMeta}>
                  <h1 className={styles.jobTitle}>{job.title}</h1>
                  <p className={styles.company}>{job.company}</p>
                  <div className={styles.metaRow}>
                    {job.location && (
                      <span className={styles.metaItem}>
                        <MapPin size={12} />
                        {job.location}
                      </span>
                    )}
                    {workMode && (
                      <span className="badge badge--default">
                        <Laptop size={11} />
                        {workMode}
                      </span>
                    )}
                    {job.employmentType && (
                      <span className="badge badge--default">
                        <Briefcase size={11} />
                        {job.employmentType}
                      </span>
                    )}
                    {dateLabel && (
                      <span className={styles.metaItem}>
                        <Calendar size={12} />
                        Posted {dateLabel}
                      </span>
                    )}
                    <span className="badge badge--default">{job.source}</span>
                    {job.salary && (
                      <span className="badge badge--success">{job.salary}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className={styles.headerActions}>
                <button
                  className={`btn btn--secondary ${saved ? styles.savedActive : ''}`}
                  onClick={() => toggleSaveJob(job)}
                  aria-label={saved ? 'Remove from saved' : 'Save job'}
                  id="detail-save-btn"
                >
                  {saved ? (
                    <><BookmarkCheck size={16} /> Saved</>
                  ) : (
                    <><Bookmark size={16} /> Save job</>
                  )}
                </button>
                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary"
                  id="detail-apply-btn"
                  onClick={() => {
                    // Automatically mark status as Applied if saved or tracked
                    if (saved && appRecord?.status === APPLICATION_STATUS.SAVED) {
                      updateApplicationStatus(job.url, APPLICATION_STATUS.APPLIED)
                    }
                  }}
                  aria-label={`Apply to ${job.title} on ${job.source} (opens in new tab)`}
                >
                  Apply on {job.source}
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>

            {/* Application Tracker Widget (if saved or tracked) */}
            <div className={`card ${styles.trackerCard}`}>
              <div className={styles.trackerHeader}>
                <div className={styles.trackerTitleWrap}>
                  <Clock size={16} className={styles.trackerIcon} />
                  <div>
                    <h2 className={styles.trackerTitle}>Application Status</h2>
                    <p className={styles.trackerSub}>
                      {appRecord
                        ? `Current stage: ${appRecord.status.toUpperCase()}`
                        : 'Track your application status for this opening'}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.statusButtons} role="group" aria-label="Change application status">
                {[
                  { key: APPLICATION_STATUS.SAVED, label: 'Saved' },
                  { key: APPLICATION_STATUS.APPLIED, label: 'Applied' },
                  { key: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing' },
                  { key: APPLICATION_STATUS.OFFER, label: 'Offer' },
                  { key: APPLICATION_STATUS.ARCHIVED, label: 'Archived' },
                ].map(s => {
                  const isActive = (appRecord?.status === s.key) || (!appRecord && s.key === APPLICATION_STATUS.SAVED && saved)
                  return (
                    <button
                      key={s.key}
                      className={`btn btn--sm ${isActive ? 'btn--primary' : 'btn--secondary'} ${styles.statusBtn}`}
                      onClick={() => handleStatusChange(s.key)}
                      id={`set-status-${s.key}`}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>

              {/* Notes form */}
              {appRecord && (
                <div className={styles.notesSection}>
                  {appRecord.notes && !showNotesForm ? (
                    <div className={styles.existingNotes}>
                      <span className={styles.notesLabel}>Your Notes:</span>
                      <p className={styles.notesText}>{appRecord.notes}</p>
                      <button
                        className={`btn btn--ghost btn--sm ${styles.editNotesBtn}`}
                        onClick={() => { setNotesInput(appRecord.notes); setShowNotesForm(true) }}
                      >
                        Edit notes
                      </button>
                    </div>
                  ) : showNotesForm ? (
                    <form onSubmit={handleSaveNotes} className={styles.notesForm}>
                      <textarea
                        className="input"
                        rows={2}
                        placeholder="Add salary discussed, interviewer names, dates, or notes…"
                        value={notesInput}
                        onChange={e => setNotesInput(e.target.value)}
                        aria-label="Application notes"
                      />
                      <div className={styles.notesActions}>
                        <button type="submit" className="btn btn--primary btn--sm">
                          Save notes
                        </button>
                        <button
                          type="button"
                          className="btn btn--ghost btn--sm"
                          onClick={() => setShowNotesForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      className={`btn btn--ghost btn--sm ${styles.addNoteBtn}`}
                      onClick={() => { setNotesInput(''); setShowNotesForm(true) }}
                    >
                      <MessageSquare size={13} />
                      Add personal note
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Match explanation Card ─────────────────── */}
            <div className={`card ${styles.matchCard}`}>
              <h2 className={styles.sectionTitle}>Match Intelligence & Fit</h2>

              <div className={styles.matchScoreRow}>
                <div
                  className={`score-ring score-ring--lg ${getScoreClass(score)}`}
                  style={{ width: 68, height: 68, fontSize: '1.2rem' }}
                  aria-label={`Match score ${score}%`}
                >
                  {score}%
                </div>
                <div>
                  <p className={styles.matchLabel}>
                    {score >= 60 ? 'Strong Match' : score >= 30 ? 'Moderate Match' : 'Partial Match'}
                  </p>
                  <p className={styles.matchSub}>
                    Evaluated against your extracted skills, role seniority, and job requirements.
                  </p>
                </div>
              </div>

              {/* Match reasons / explanations */}
              {matchReasons.length > 0 && (
                <div className={styles.matchReasonsList}>
                  <p className={styles.matchSectionTitle}>
                    <CheckSquare size={14} color="var(--accent)" />
                    Why this opportunity matches your profile
                  </p>
                  <ul className={styles.reasonsList}>
                    {matchReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Matched capabilities */}
              {matchedSkills.length > 0 && (
                <div className={styles.matchSection}>
                  <p className={styles.matchSectionTitle}>
                    <CheckCircle2 size={14} color="var(--success)" />
                    Matched capabilities ({matchedSkills.length})
                  </p>
                  <div className={styles.chips}>
                    {matchedSkills.map(s => (
                      <span key={s} className="skill-chip skill-chip--matched">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing requirements / skill gaps */}
              {missingRequirements.length > 0 && (
                <div className={styles.matchSection}>
                  <p className={styles.matchSectionTitle}>
                    <AlertCircle size={14} color="var(--warning)" />
                    Missing or unverified requirements ({missingRequirements.length})
                  </p>
                  <p className={styles.gapSub}>
                    These skills or tools are mentioned in the posting but were not explicitly identified in your resume:
                  </p>
                  <div className={styles.chips}>
                    {missingRequirements.map(s => (
                      <span key={s} className={styles.gapChip}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ── Responsibilities (if present) ──────────── */}
            {responsibilities.length > 0 && (
              <div className={`card ${styles.descCard}`}>
                <h2 className={styles.sectionTitle}>Key Responsibilities</h2>
                <ul className={styles.bulletList}>
                  {responsibilities.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            {/* ── Requirements (if present) ──────────────── */}
            {requirements.length > 0 && (
              <div className={`card ${styles.descCard}`}>
                <h2 className={styles.sectionTitle}>Qualifications & Requirements</h2>
                <ul className={styles.bulletList}>
                  {requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>
            )}

            {/* ── Description ──────────────────────────── */}
            {job.description && (
              <div className={`card ${styles.descCard}`}>
                <h2 className={styles.sectionTitle}>Job description</h2>
                <div className={styles.description}>
                  {job.description.split('\n').filter(Boolean).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── Sidebar ───────────────────────────────── */}
          <aside className={styles.sidebar}>
            <div className={`card ${styles.sideCard}`}>
              <h3 className={styles.sideTitle}>Job Overview</h3>
              <div className={styles.sideItems}>
                {job.company && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Company</span>
                    <span className={styles.sideValue}>{job.company}</span>
                  </div>
                )}
                {job.location && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Location</span>
                    <span className={styles.sideValue}>{job.location}</span>
                  </div>
                )}
                {workMode && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Work Mode</span>
                    <span className={styles.sideValue}>{workMode}</span>
                  </div>
                )}
                {job.employmentType && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Employment</span>
                    <span className={styles.sideValue}>{job.employmentType}</span>
                  </div>
                )}
                {job.source && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Job Source</span>
                    <span className={styles.sideValue}>{job.source}</span>
                  </div>
                )}
                {dateLabel && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Posted</span>
                    <span className={styles.sideValue}>{dateLabel}</span>
                  </div>
                )}
                {job.salary && (
                  <div className={styles.sideItem}>
                    <span className={styles.sideLabel}>Salary</span>
                    <span className={styles.sideValue}>{job.salary}</span>
                  </div>
                )}
              </div>

              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--space-4)' }}
                id="sidebar-apply-btn"
                onClick={() => {
                  if (saved && appRecord?.status === APPLICATION_STATUS.SAVED) {
                    updateApplicationStatus(job.url, APPLICATION_STATUS.APPLIED)
                  }
                }}
              >
                Apply on {job.source}
                <ExternalLink size={14} />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  )
}
