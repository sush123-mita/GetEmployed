import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, SlidersHorizontal, RotateCcw, Frown, X,
  FileCheck, ChevronDown, ChevronUp, MapPin, Laptop, Sparkles
} from 'lucide-react'
import { useApp, VIEWS } from '../context/AppContext'
import JobCard from '../components/JobCard'
import CandidateProfile from '../components/CandidateProfile'
import styles from './ResultsPage.module.css'

const SORT_OPTIONS = [
  { value: 'matchScore', label: 'Best match' },
  { value: 'date',       label: 'Most recent' },
  { value: 'location',   label: 'Location' },
]

const SOURCE_OPTIONS = [
  { value: 'all',    label: 'All sources' },
  { value: 'Adzuna', label: 'Adzuna' },
  { value: 'Jooble', label: 'Jooble' },
]

const LEVEL_OPTIONS = [
  { value: 'all',    label: 'All levels' },
  { value: 'entry',  label: 'Entry' },
  { value: 'mid',    label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead',   label: 'Lead' },
]

const WORK_MODE_OPTIONS = [
  { value: 'all',     label: 'All modes' },
  { value: 'remote',  label: 'Remote only' },
  { value: 'hybrid',  label: 'Hybrid' },
  { value: 'on-site', label: 'On-site' },
]

const MIN_SCORE_OPTIONS = [
  { value: 0,  label: 'All scores' },
  { value: 70, label: '70%+ Strong match' },
  { value: 50, label: '50%+ Good match' },
  { value: 30, label: '30%+ Partial match' },
]

export default function ResultsPage() {
  const {
    results,
    sortBy,
    filterSource,
    filterLevel,
    filterWorkMode,
    filterMinScore,
    searchQuery,
    navigate,
    reset,
    dispatch,
  } = useApp()

  const [showFilters, setShowFilters] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const jobs = results?.jobs ?? []

  // Dynamic locations from data
  const locations = useMemo(() => {
    const set = new Set()
    jobs.forEach(j => {
      if (j.location) {
        const clean = j.location.split(',')[0].trim()
        if (clean) set.add(clean)
      }
    })
    return Array.from(set).slice(0, 15)
  }, [jobs])

  const filtered = useMemo(() => {
    let list = [...jobs]

    // search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.location?.toLowerCase().includes(q) ||
        j.matchedSkills?.some(s => s.toLowerCase().includes(q))
      )
    }

    // source filter
    if (filterSource !== 'all') {
      list = list.filter(j => j.source === filterSource)
    }

    // level filter
    if (filterLevel !== 'all') {
      list = list.filter(j => {
        const combined = `${j.title} ${j.description}`.toLowerCase()
        const map = {
          entry: ['junior', 'entry', 'graduate', 'fresher', 'associate'],
          mid: ['mid', 'intermediate', 'staff'],
          senior: ['senior', 'sr.', 'sr '],
          lead: ['lead', 'principal', 'staff', 'head of', 'director'],
        }
        return map[filterLevel]?.some(kw => combined.includes(kw))
      })
    }

    // work mode filter
    if (filterWorkMode !== 'all') {
      list = list.filter(j => {
        const text = `${j.title} ${j.location} ${j.description} ${j.workMode || ''}`.toLowerCase()
        if (filterWorkMode === 'remote') return text.includes('remote') || text.includes('work from home')
        if (filterWorkMode === 'hybrid') return text.includes('hybrid')
        if (filterWorkMode === 'on-site') return text.includes('on-site') || text.includes('onsite') || text.includes('in-office')
        return true
      })
    }

    // min score filter
    if (filterMinScore > 0) {
      list = list.filter(j => (j.matchScore ?? 0) >= filterMinScore)
    }

    // sort
    list.sort((a, b) => {
      if (sortBy === 'matchScore') return (b.matchScore ?? 0) - (a.matchScore ?? 0)
      if (sortBy === 'date') {
        const da = a.postedDate ? new Date(a.postedDate) : new Date(0)
        const db = b.postedDate ? new Date(b.postedDate) : new Date(0)
        return db - da
      }
      if (sortBy === 'location') {
        return (a.location || '').localeCompare(b.location || '')
      }
      return 0
    })

    return list
  }, [jobs, searchQuery, filterSource, filterLevel, filterWorkMode, filterMinScore, sortBy])

  const hasActiveFilter =
    filterSource !== 'all' ||
    filterLevel !== 'all' ||
    filterWorkMode !== 'all' ||
    filterMinScore > 0 ||
    searchQuery.trim().length > 0

  const clearFilters = () => {
    dispatch({ type: 'SET_FILTER_SOURCE', payload: 'all' })
    dispatch({ type: 'SET_FILTER_LEVEL', payload: 'all' })
    dispatch({ type: 'SET_FILTER_WORK_MODE', payload: 'all' })
    dispatch({ type: 'SET_FILTER_MIN_SCORE', payload: 0 })
    dispatch({ type: 'SET_SEARCH', payload: '' })
  }

  // ATS summary
  const atsScore = results?.ats?.score ?? results?.atsScore ?? 82

  if (!results) {
    return null
  }

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`}>

        {/* ── Top bar ─────────────────────────────────────── */}
        <div className={styles.topBar}>
          <div className={styles.topLeft}>
            <h1 className={`title ${styles.pageTitle}`}>
              {filtered.length > 0
                ? <>{filtered.length} matching jobs</>
                : 'No matches found'}
            </h1>
            {results.role && (
              <span className="badge badge--default" style={{ marginLeft: '0.5rem' }}>
                {results.role}
              </span>
            )}
            <button
              className={styles.atsPill}
              onClick={() => setProfileOpen(true)}
              aria-label="View ATS Score and Candidate Profile"
              title="Click to view full ATS report"
            >
              <FileCheck size={13} />
              <span>ATS Score: <strong>{atsScore}/100</strong></span>
            </button>
          </div>

          <div className={styles.topActions}>
            <button
              className={`btn btn--ghost btn--sm ${styles.profileToggle}`}
              onClick={() => setProfileOpen(v => !v)}
              id="toggle-profile-btn"
              aria-expanded={profileOpen}
            >
              {profileOpen ? (
                <>Hide profile <ChevronUp size={14} /></>
              ) : (
                <>Profile & ATS <ChevronDown size={14} /></>
              )}
            </button>
            <button
              className="btn btn--secondary btn--sm"
              onClick={() => { reset(); navigate(VIEWS.UPLOAD) }}
              id="new-analysis-btn"
            >
              <RotateCcw size={14} />
              New analysis
            </button>
          </div>
        </div>

        {/* ── Candidate profile & ATS (collapsible) ────────── */}
        <AnimatePresence>
          {profileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <CandidateProfile results={results} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Skill chips ──────────────────────────────────── */}
        {results.detectedSkills?.length > 0 && (
          <div className={styles.skillsRow}>
            <span className={styles.skillsLabel}>Matched on:</span>
            <div className={styles.skillsChips} role="list" aria-label="Detected skills">
              {results.detectedSkills.map(skill => (
                <motion.span
                  key={skill}
                  className="skill-chip"
                  role="listitem"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => dispatch({ type: 'SET_SEARCH', payload: skill })}
                  style={{ cursor: 'pointer' }}
                  title={`Filter by ${skill}`}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* ── Controls ─────────────────────────────────────── */}
        <div className={styles.controls}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={`input ${styles.searchInput}`}
              type="search"
              placeholder="Search by title, skill, company or location…"
              value={searchQuery}
              onChange={e => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
              aria-label="Search jobs"
              id="job-search-input"
            />
            {searchQuery && (
              <button
                className={styles.searchClear}
                onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            className={`input select ${styles.select}`}
            value={sortBy}
            onChange={e => dispatch({ type: 'SET_SORT', payload: e.target.value })}
            aria-label="Sort jobs"
            id="job-sort-select"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {/* Filter toggle */}
          <button
            className={`btn btn--secondary btn--sm ${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`}
            onClick={() => setShowFilters(v => !v)}
            id="toggle-filters-btn"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasActiveFilter && <span className={styles.filterDot} aria-hidden="true" />}
          </button>
        </div>

        {/* ── Filter panel ──────────────────────────────────── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className={styles.filterPanel}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.filterPanelInner}>
                {/* Work mode */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="filter-workmode">Work Mode</label>
                  <select
                    id="filter-workmode"
                    className={`input select ${styles.filterSelect}`}
                    value={filterWorkMode}
                    onChange={e => dispatch({ type: 'SET_FILTER_WORK_MODE', payload: e.target.value })}
                  >
                    {WORK_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Min Match Relevance */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="filter-minscore">Match Relevance</label>
                  <select
                    id="filter-minscore"
                    className={`input select ${styles.filterSelect}`}
                    value={filterMinScore}
                    onChange={e => dispatch({ type: 'SET_FILTER_MIN_SCORE', payload: Number(e.target.value) })}
                  >
                    {MIN_SCORE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Source */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="filter-source">Source</label>
                  <select
                    id="filter-source"
                    className={`input select ${styles.filterSelect}`}
                    value={filterSource}
                    onChange={e => dispatch({ type: 'SET_FILTER_SOURCE', payload: e.target.value })}
                  >
                    {SOURCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Level */}
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="filter-level">Experience Level</label>
                  <select
                    id="filter-level"
                    className={`input select ${styles.filterSelect}`}
                    value={filterLevel}
                    onChange={e => dispatch({ type: 'SET_FILTER_LEVEL', payload: e.target.value })}
                  >
                    {LEVEL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {hasActiveFilter && (
                  <button
                    className="btn btn--ghost btn--sm"
                    onClick={clearFilters}
                    id="clear-filters-btn"
                  >
                    <X size={13} />
                    Clear filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Active Filter Pills ─────────────────────────── */}
        {hasActiveFilter && (
          <div className={styles.activePillsRow}>
            <span className={styles.activePillsLabel}>Active filters:</span>
            {searchQuery && (
              <span className={styles.activePill}>
                Search: "{searchQuery}"
                <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })}>×</button>
              </span>
            )}
            {filterWorkMode !== 'all' && (
              <span className={styles.activePill}>
                Mode: {filterWorkMode}
                <button onClick={() => dispatch({ type: 'SET_FILTER_WORK_MODE', payload: 'all' })}>×</button>
              </span>
            )}
            {filterMinScore > 0 && (
              <span className={styles.activePill}>
                Score: {filterMinScore}%+
                <button onClick={() => dispatch({ type: 'SET_FILTER_MIN_SCORE', payload: 0 })}>×</button>
              </span>
            )}
            {filterSource !== 'all' && (
              <span className={styles.activePill}>
                Source: {filterSource}
                <button onClick={() => dispatch({ type: 'SET_FILTER_SOURCE', payload: 'all' })}>×</button>
              </span>
            )}
            {filterLevel !== 'all' && (
              <span className={styles.activePill}>
                Level: {filterLevel}
                <button onClick={() => dispatch({ type: 'SET_FILTER_LEVEL', payload: 'all' })}>×</button>
              </span>
            )}
            <button className={styles.clearAllLink} onClick={clearFilters}>
              Reset all
            </button>
          </div>
        )}

        {/* ── Job grid / empty state ─────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            hasQuery={hasActiveFilter}
            onClear={clearFilters}
            onReset={() => { reset(); navigate(VIEWS.UPLOAD) }}
          />
        ) : (
          <motion.div
            className={styles.grid}
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {filtered.map((job, i) => (
              <motion.div
                key={`${job.url}-${i}`}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                }}
              >
                <JobCard job={job} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasQuery, onClear, onReset }) {
  return (
    <motion.div
      className={styles.empty}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Frown size={40} strokeWidth={1.2} color="var(--text-tertiary)" />
      <h2 className={styles.emptyTitle}>
        {hasQuery ? 'No results for these filters' : 'No strong matches found'}
      </h2>
      <p className={styles.emptyBody}>
        {hasQuery
          ? 'Try adjusting your search query, work mode, or lowering the match threshold.'
          : 'Try uploading a different resume, or check that your API keys are configured.'}
      </p>
      <div className={styles.emptyActions}>
        {hasQuery && (
          <button className="btn btn--secondary" onClick={onClear}>Clear filters</button>
        )}
        <button className="btn btn--primary" onClick={onReset}>
          <RotateCcw size={15} />
          Try again
        </button>
      </div>
    </motion.div>
  )
}
