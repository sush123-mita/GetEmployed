import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark, RotateCcw, Trash2, Clock, CheckCircle2,
  Calendar, Building2, MessageSquare, History, ArrowUpRight,
  ExternalLink, Laptop, Filter
} from 'lucide-react'
import { useApp, VIEWS, APPLICATION_STATUS } from '../context/AppContext'
import JobCard from '../components/JobCard'
import styles from './SavedJobsPage.module.css'

const TABS = [
  { id: 'all',          label: 'All Tracked' },
  { id: 'saved',        label: 'Saved' },
  { id: 'applied',      label: 'Applied' },
  { id: 'interviewing', label: 'Interviewing' },
  { id: 'offers',       label: 'Offers & Done' },
  { id: 'history',      label: 'Activity Log' },
]

export default function SavedJobsPage() {
  const {
    savedJobs,
    applications,
    navigate,
    clearAllSaved,
    updateApplicationStatus,
    updateApplicationNotes,
    selectJob,
  } = useApp()

  const [activeTab, setActiveTab] = useState('all')
  const [editingNoteJobUrl, setEditingNoteJobUrl] = useState(null)
  const [noteText, setNoteText] = useState('')

  // Map jobs with applications
  const trackedItems = applications.length > 0
    ? applications
    : savedJobs.map(job => ({
        id: job.url,
        job,
        status: APPLICATION_STATUS.SAVED,
        savedAt: new Date().toISOString(),
        history: [{ timestamp: new Date().toISOString(), action: 'Saved to dashboard' }]
      }))

  const savedCount = trackedItems.filter(a => a.status === APPLICATION_STATUS.SAVED).length
  const appliedCount = trackedItems.filter(a => a.status === APPLICATION_STATUS.APPLIED).length
  const interviewingCount = trackedItems.filter(a => a.status === APPLICATION_STATUS.INTERVIEWING).length
  const offersCount = trackedItems.filter(a => a.status === APPLICATION_STATUS.OFFER || a.status === APPLICATION_STATUS.ARCHIVED).length

  // Filter by tab
  const filteredItems = trackedItems.filter(app => {
    if (activeTab === 'all') return true
    if (activeTab === 'saved') return app.status === APPLICATION_STATUS.SAVED
    if (activeTab === 'applied') return app.status === APPLICATION_STATUS.APPLIED
    if (activeTab === 'interviewing') return app.status === APPLICATION_STATUS.INTERVIEWING
    if (activeTab === 'offers') return app.status === APPLICATION_STATUS.OFFER || app.status === APPLICATION_STATUS.ARCHIVED
    return true
  })

  // Aggregate all history events across applications
  const allHistoryEvents = trackedItems
    .flatMap(app => (app.history || []).map(h => ({
      ...h,
      jobTitle: app.job?.title || 'Job Opening',
      company: app.job?.company || 'Company',
      url: app.job?.url,
    })))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const handleSaveNote = (jobUrl) => {
    updateApplicationNotes(jobUrl, noteText)
    setEditingNoteJobUrl(null)
    setNoteText('')
  }

  const getTabBadge = (tabId) => {
    switch (tabId) {
      case 'all': return trackedItems.length
      case 'saved': return savedCount
      case 'applied': return appliedCount
      case 'interviewing': return interviewingCount
      case 'offers': return offersCount
      case 'history': return allHistoryEvents.length
      default: return null
    }
  }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}><Bookmark size={22} /></span>
            <div>
              <h1 className={`title ${styles.title}`}>Saved Jobs & Application Tracker</h1>
              <p className={styles.subtitle}>
                Organize, track application progress, and manage interviews for this session
              </p>
            </div>
            {trackedItems.length > 0 && (
              <span className="badge badge--accent">{trackedItems.length}</span>
            )}
          </div>

          {trackedItems.length > 0 && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={clearAllSaved}
              id="clear-saved-btn"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          )}
        </div>

        {/* ── Navigation Tabs ──────────────────────────────── */}
        <div className={styles.tabsRow} role="tablist">
          {TABS.map(tab => {
            const count = getTabBadge(tab.id)
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
                id={`tab-${tab.id}`}
              >
                {tab.label}
                {count > 0 && (
                  <span className={`${styles.tabCount} ${isActive ? styles.tabCountActive : ''}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Content Area ─────────────────────────────────── */}
        {activeTab === 'history' ? (
          /* Activity Log view */
          allHistoryEvents.length === 0 ? (
            <EmptyHistoryTab onUpload={() => navigate(VIEWS.UPLOAD)} />
          ) : (
            <div className={`card ${styles.historyCard}`}>
              <h2 className={styles.historyTitle}>
                <History size={16} /> Application Timeline & Activity
              </h2>
              <div className={styles.timeline}>
                {allHistoryEvents.map((evt, i) => (
                  <div key={i} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <strong className={styles.timelineAction}>{evt.action}</strong>
                        <span className={styles.timelineDate}>
                          {new Date(evt.timestamp).toLocaleString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className={styles.timelineJob}>
                        {evt.jobTitle} · <span>{evt.company}</span>
                      </p>
                      {evt.note && (
                        <p className={styles.timelineNote}>"{evt.note}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : filteredItems.length === 0 ? (
          /* Empty state for jobs */
          <EmptyTrackedTab tab={activeTab} onUpload={() => navigate(VIEWS.UPLOAD)} />
        ) : (
          /* Tracked items list/grid */
          <motion.div
            className={styles.grid}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {filteredItems.map(({ id, job, status, notes }) => (
              <motion.div
                key={id}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                }}
                className={styles.itemWrapper}
              >
                <div className={`card ${styles.trackedCard}`}>
                  <JobCard job={job} />

                  {/* Status manager row */}
                  <div className={styles.cardStatusRow}>
                    <div className={styles.statusLabelWrap}>
                      <span className={styles.statusTextLabel}>Status:</span>
                      <select
                        className={`input select ${styles.statusSelect}`}
                        value={status}
                        onChange={(e) => updateApplicationStatus(job.url, e.target.value)}
                        aria-label="Change job application status"
                      >
                        <option value={APPLICATION_STATUS.SAVED}>Saved</option>
                        <option value={APPLICATION_STATUS.APPLIED}>Applied</option>
                        <option value={APPLICATION_STATUS.INTERVIEWING}>Interviewing</option>
                        <option value={APPLICATION_STATUS.OFFER}>Offer</option>
                        <option value={APPLICATION_STATUS.ARCHIVED}>Archived</option>
                      </select>
                    </div>

                    {/* Notes toggle */}
                    {editingNoteJobUrl === job.url ? (
                      <div className={styles.notesEditor}>
                        <input
                          type="text"
                          className="input"
                          placeholder="Note e.g. applied on company portal, recruiter call on Monday…"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveNote(job.url)
                          }}
                        />
                        <button
                          className="btn btn--primary btn--sm"
                          onClick={() => handleSaveNote(job.url)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setEditingNoteJobUrl(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className={styles.notesDisplay}>
                        {notes ? (
                          <div className={styles.notesContent}>
                            <span className={styles.notesExcerpt}>"{notes}"</span>
                            <button
                              className={styles.editNoteLink}
                              onClick={() => {
                                setNoteText(notes)
                                setEditingNoteJobUrl(job.url)
                              }}
                            >
                              Edit note
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.addNoteBtn}
                            onClick={() => {
                              setNoteText('')
                              setEditingNoteJobUrl(job.url)
                            }}
                          >
                            <MessageSquare size={12} />
                            Add note
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <p className={styles.note}>
          Application tracking and saved jobs are maintained in this browser session. The backend API contracts are ready for database persistence.
        </p>
      </div>
    </div>
  )
}

function EmptyTrackedTab({ tab, onUpload }) {
  const messages = {
    all: {
      title: 'No saved jobs or applications yet',
      sub: 'When you find jobs you like, bookmark them to manage your application pipeline.',
    },
    saved: {
      title: 'No jobs in Saved stage',
      sub: 'Save promising job postings from your recommendations to review later.',
    },
    applied: {
      title: 'No submitted applications yet',
      sub: 'Mark jobs as "Applied" once you have sent in your resume to keep track.',
    },
    interviewing: {
      title: 'No interviews in progress',
      sub: 'Update jobs to "Interviewing" when recruiters reach out for screenings or rounds.',
    },
    offers: {
      title: 'No offers or archived records',
      sub: 'Track job offers or archived positions here.',
    },
  }

  const current = messages[tab] || messages.all

  return (
    <motion.div
      className={styles.empty}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className={styles.emptyIcon} aria-hidden="true">
        <Bookmark size={40} strokeWidth={1.2} />
      </span>
      <h2 className={styles.emptyTitle}>{current.title}</h2>
      <p className={styles.emptyBody}>{current.sub}</p>
      <button
        className="btn btn--primary"
        onClick={onUpload}
        id="empty-find-jobs-btn"
      >
        <RotateCcw size={15} />
        Analyze a resume
      </button>
    </motion.div>
  )
}

function EmptyHistoryTab({ onUpload }) {
  return (
    <motion.div
      className={styles.empty}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className={styles.emptyIcon} aria-hidden="true">
        <History size={40} strokeWidth={1.2} />
      </span>
      <h2 className={styles.emptyTitle}>No activity logged yet</h2>
      <p className={styles.emptyBody}>
        As you save openings, mark applications as submitted, and log notes, your chronological timeline will appear here.
      </p>
      <button
        className="btn btn--primary"
        onClick={onUpload}
      >
        <RotateCcw size={15} />
        Find jobs to track
      </button>
    </motion.div>
  )
}
