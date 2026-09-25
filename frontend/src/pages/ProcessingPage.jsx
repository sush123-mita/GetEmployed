import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'
import { useApp, STAGES } from '../context/AppContext'
import styles from './ProcessingPage.module.css'

export default function ProcessingPage() {
  const { processingStage, resumeFile, uploadProgress, cancelAnalysis } = useApp()

  const stageProgressPct = Math.round(((processingStage + 1) / STAGES.length) * 100)

  return (
    <div className={styles.page}>
      <div className={`container container--narrow ${styles.inner}`}>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Spinner */}
          <div className={styles.spinnerWrap} aria-hidden="true">
            <motion.div
              className={styles.spinner}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
            <div className={styles.spinnerInner}>
              <span className={styles.spinnerIcon}>⚡</span>
            </div>
          </div>

          <h1 className={`title ${styles.heading}`}>Analyzing your profile</h1>
          {resumeFile && (
            <p className={styles.fileName}>{resumeFile.name}</p>
          )}

          {/* Progress bar */}
          <div className={styles.progressTrack} aria-label="Analysis progress">
            <div
              className={styles.progressFill}
              style={{ width: `${stageProgressPct}%` }}
            />
          </div>

          {/* Stage list */}
          <div className={styles.stages} role="status" aria-live="polite">
            {STAGES.map((stage, i) => {
              const isDone    = i < processingStage
              const isActive  = i === processingStage
              const isPending = i > processingStage

              return (
                <motion.div
                  key={stage.id}
                  className={`${styles.stage} ${isDone ? styles.stageDone : ''} ${isActive ? styles.stageActive : ''} ${isPending ? styles.stagePending : ''}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <div className={styles.stageIndicator}>
                    <AnimatePresence mode="wait">
                      {isDone ? (
                        <motion.span
                          key="done"
                          className={styles.stageCheck}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <CheckCircle2 size={18} />
                        </motion.span>
                      ) : isActive ? (
                        <motion.span
                          key="active"
                          className={styles.stageDot}
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      ) : (
                        <span key="pending" className={styles.stageDotPending} />
                      )}
                    </AnimatePresence>
                  </div>

                  <div className={styles.stageText}>
                    <span className={styles.stageLabel}>{stage.label}</span>
                    {isActive && (
                      <motion.span
                        className={styles.stageDetail}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {stage.detail}
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          <div className={styles.footerActions}>
            <button
              className={`btn btn--ghost btn--sm ${styles.cancelBtn}`}
              onClick={cancelAnalysis}
              id="cancel-analysis-btn"
            >
              <X size={14} />
              Cancel analysis
            </button>
            <p className={styles.note}>
              Live job search and LLM extraction typically take 10–20 seconds.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
