import { motion } from 'framer-motion'
import { Briefcase, Bookmark, Upload, LayoutGrid } from 'lucide-react'
import { useApp, VIEWS } from '../context/AppContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { navigate, view, savedJobs, applications, results, reset } = useApp()

  const totalTracked = Math.max(savedJobs.length, applications.length)

  return (
    <header className={styles.header}>
      <nav className={`container ${styles.nav}`} aria-label="Main navigation">
        <button
          className={styles.logo}
          onClick={() => { reset(); navigate(VIEWS.LANDING) }}
          aria-label="GetEmployed home"
        >
          <span className={styles.logoIcon}>
            <Briefcase size={18} strokeWidth={2.5} />
          </span>
          <span className={styles.logoText}>
            Get<strong>Employed</strong>
          </span>
        </button>

        <div className={styles.actions}>
          {results && view !== VIEWS.RESULTS && view !== VIEWS.PROCESSING && (
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => navigate(VIEWS.RESULTS)}
              id="nav-results-btn"
              aria-label="Return to job recommendations"
            >
              <LayoutGrid size={14} />
              <span className="hide-mobile">Matches</span>
            </button>
          )}

          {view !== VIEWS.UPLOAD && view !== VIEWS.PROCESSING && (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => navigate(VIEWS.UPLOAD)}
              id="nav-upload-btn"
            >
              <Upload size={14} />
              <span className="hide-mobile">Analyze Resume</span>
            </button>
          )}

          <button
            className={`btn btn--ghost btn--sm ${styles.savedBtn} ${view === VIEWS.SAVED ? styles.activeNavBtn : ''}`}
            onClick={() => navigate(VIEWS.SAVED)}
            aria-label={`Saved & Applications (${totalTracked})`}
            id="nav-saved-btn"
          >
            <Bookmark size={15} />
            <span className="hide-mobile">Tracker</span>
            {totalTracked > 0 && (
              <motion.span
                className={styles.savedCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={totalTracked}
              >
                {totalTracked}
              </motion.span>
            )}
          </button>
        </div>
      </nav>
    </header>
  )
}
