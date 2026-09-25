import { motion } from 'framer-motion'
import {
  MapPin, Calendar, ExternalLink, Bookmark, BookmarkCheck,
  Building2, Laptop, AlertCircle, CheckCircle2, Clock
} from 'lucide-react'
import { useApp, APPLICATION_STATUS } from '../context/AppContext'
import styles from './JobCard.module.css'

function getScoreClass(score) {
  if (score >= 60) return 'score-ring--high'
  if (score >= 30) return 'score-ring--medium'
  return 'score-ring--low'
}

function getScoreLabel(score) {
  if (score >= 60) return 'Strong match'
  if (score >= 30) return 'Good match'
  return 'Partial match'
}

function formatDate(dateStr) {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  } catch {
    return null
  }
}

function detectWorkMode(job) {
  if (job.workMode) return job.workMode
  const text = `${job.title} ${job.location} ${job.description}`.toLowerCase()
  if (text.includes('remote') || text.includes('work from home')) return 'Remote'
  if (text.includes('hybrid')) return 'Hybrid'
  if (text.includes('on-site') || text.includes('onsite') || text.includes('in-office')) return 'On-site'
  return null
}

export default function JobCard({ job }) {
  const { selectJob, toggleSaveJob, isJobSaved, getApplication } = useApp()
  const saved = isJobSaved(job)
  const appRecord = getApplication(job.url)
  const score = Math.round(job.matchScore ?? 0)
  const dateLabel = formatDate(job.postedDate)
  const workMode = detectWorkMode(job)
  const missingRequirements = job.missingSkills || job.missingRequirements || []

  return (
    <article
      className={`card card--interactive ${styles.card}`}
      aria-label={`${job.title} at ${job.company}`}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.companyBadge} aria-hidden="true">
          <Building2 size={16} strokeWidth={1.5} />
        </div>
        <div className={styles.headerText}>
          <button
            className={styles.jobTitle}
            onClick={() => selectJob(job)}
            id={`job-title-${encodeURIComponent(job.url).slice(0, 20)}`}
          >
            {job.title}
          </button>
          <span className={styles.company}>{job.company}</span>
        </div>
        <button
          className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
          onClick={() => toggleSaveJob(job)}
          aria-label={saved ? 'Remove from saved' : 'Save job'}
          aria-pressed={saved}
          id={`save-job-${encodeURIComponent(job.url).slice(0, 20)}`}
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>
      </div>

      {/* ── Meta & Badges ───────────────────────────────── */}
      <div className={styles.meta}>
        {job.location && (
          <span className={styles.metaItem}>
            <MapPin size={12} />
            {job.location}
          </span>
        )}
        {workMode && (
          <span className={`badge badge--default ${styles.workModeBadge}`}>
            <Laptop size={11} />
            {workMode}
          </span>
        )}
        {dateLabel && (
          <span className={styles.metaItem}>
            <Calendar size={12} />
            {dateLabel}
          </span>
        )}
        {job.source && (
          <span className={`badge badge--default ${styles.sourceBadge}`}>
            {job.source}
          </span>
        )}
        {appRecord && appRecord.status !== APPLICATION_STATUS.SAVED && (
          <span className={`badge badge--accent ${styles.statusBadge}`}>
            <Clock size={11} />
            {appRecord.status.toUpperCase()}
          </span>
        )}
      </div>

      {/* ── Score & Salary ─────────────────────────────── */}
      <div className={styles.scoreRow}>
        <div className={`score-ring ${getScoreClass(score)}`} aria-label={`Match score ${score}%`}>
          {score}%
        </div>
        <div className={styles.scoreInfo}>
          <span className={styles.scoreLabel}>{getScoreLabel(score)}</span>
          {job.salary && <span className={styles.salary}>{job.salary}</span>}
        </div>
      </div>

      {/* ── Matched capabilities ────────────────────────── */}
      {job.matchedSkills?.length > 0 && (
        <div className={styles.matchedSkills} aria-label="Matched capabilities">
          {job.matchedSkills.slice(0, 6).map(skill => (
            <span key={skill} className="skill-chip skill-chip--matched">
              {skill}
            </span>
          ))}
          {job.matchedSkills.length > 6 && (
            <span className="skill-chip">+{job.matchedSkills.length - 6}</span>
          )}
        </div>
      )}

      {/* ── Missing requirements (if provided) ──────────── */}
      {missingRequirements.length > 0 && (
        <div className={styles.missingSkills} aria-label="Missing requirements">
          <span className={styles.missingLabel}>
            <AlertCircle size={11} />
            Gap:
          </span>
          {missingRequirements.slice(0, 2).map((skill, idx) => (
            <span key={idx} className={styles.missingChip}>
              {skill}
            </span>
          ))}
          {missingRequirements.length > 2 && (
            <span className={styles.missingChip}>+{missingRequirements.length - 2}</span>
          )}
        </div>
      )}

      {/* ── Description snippet ─────────────────────────── */}
      {job.description && (
        <p className={styles.snippet}>
          {job.description.slice(0, 140)}{job.description.length > 140 ? '…' : ''}
        </p>
      )}

      {/* ── Actions ────────────────────────────────────── */}
      <div className={styles.actions}>
        <button
          className={`btn btn--ghost btn--sm ${styles.detailsBtn}`}
          onClick={() => selectJob(job)}
          id={`view-details-${encodeURIComponent(job.url).slice(0, 20)}`}
        >
          View details
        </button>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn btn--primary btn--sm ${styles.applyBtn}`}
          aria-label={`Apply to ${job.title} at ${job.company} (opens in new tab)`}
          id={`apply-${encodeURIComponent(job.url).slice(0, 20)}`}
        >
          Apply
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  )
}
