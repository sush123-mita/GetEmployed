import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import styles from './UploadPage.module.css'

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function getFileIcon(file) {
  return file?.name?.toLowerCase().endsWith('.pdf') ? '📄' : '📝'
}

export default function UploadPage() {
  const { startAnalysis, error } = useApp()
  const [file, setFile]         = useState(null)
  const [rejectMsg, setRejectMsg] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    setRejectMsg('')
    if (rejected.length > 0) {
      const err = rejected[0]?.errors?.[0]
      if (err?.code === 'file-too-large') setRejectMsg('File exceeds 5 MB limit. Please use a smaller file.')
      else if (err?.code === 'file-invalid-type') setRejectMsg('Only PDF and DOCX files are accepted.')
      else setRejectMsg('Invalid file. Please try again.')
      return
    }
    if (accepted.length > 0) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    multiple: false,
  })

  const handleRemove = (e) => {
    e.stopPropagation()
    setFile(null)
    setRejectMsg('')
  }

  const handleAnalyze = () => {
    if (file) startAnalysis(file)
  }

  const dropzoneState = isDragReject ? 'reject' : isDragActive ? 'active' : file ? 'filled' : 'idle'

  return (
    <div className={styles.page}>
      <div className={`container container--narrow ${styles.inner}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.header}>
            <h1 className={`headline ${styles.title}`}>Upload your resume</h1>
            <p className={styles.subtitle}>
              PDF or DOCX · up to 5 MB · no account required
            </p>
          </div>

          {/* Error from API */}
          <AnimatePresence>
            {error && (
              <motion.div
                className={styles.errorBanner}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                role="alert"
              >
                <AlertCircle size={16} className={styles.errorIcon} />
                <div>
                  <strong>Analysis failed</strong>
                  <p>{error.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`${styles.dropzone} ${styles[`dropzone--${dropzoneState}`]}`}
            role="button"
            aria-label="Upload resume: drag and drop or click to browse"
            tabIndex={0}
          >
            <input {...getInputProps()} id="resume-file-input" aria-label="Resume file input" />

            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="empty"
                  className={styles.dropContent}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`${styles.uploadIcon} ${isDragActive ? styles.uploadIconActive : ''}`}>
                    <UploadCloud size={32} strokeWidth={1.5} />
                  </div>
                  <div className={styles.dropText}>
                    {isDragReject
                      ? <span className={styles.dropTextReject}>That file type isn't supported</span>
                      : isDragActive
                      ? <span className={styles.dropTextActive}>Drop to upload</span>
                      : <>
                          <span className={styles.dropTextPrimary}>
                            Drag & drop your resume, or <span className={styles.browse}>browse</span>
                          </span>
                          <span className={styles.dropTextSub}>PDF or DOCX · max 5 MB</span>
                        </>
                    }
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="filled"
                  className={styles.filePreview}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={styles.fileEmoji} aria-hidden="true">{getFileIcon(file)}</span>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{file.name}</span>
                    <span className={styles.fileSize}>{formatBytes(file.size)}</span>
                  </div>
                  <div className={styles.fileStatus}>
                    <CheckCircle2 size={18} color="var(--success)" />
                    <span>Ready</span>
                  </div>
                  <button
                    className={`btn btn--ghost btn--sm ${styles.removeBtn}`}
                    onClick={handleRemove}
                    aria-label="Remove file"
                    id="remove-file-btn"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Validation error */}
          <AnimatePresence>
            {rejectMsg && (
              <motion.p
                className={styles.rejectMsg}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
              >
                <AlertCircle size={13} />
                {rejectMsg}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Supported formats */}
          <div className={styles.formats}>
            {['PDF', 'DOCX'].map(f => (
              <span key={f} className={styles.formatBadge}>
                <FileText size={12} />{f}
              </span>
            ))}
          </div>

          {/* Action */}
          <button
            className={`btn btn--primary btn--lg ${styles.analyzeBtn}`}
            onClick={handleAnalyze}
            disabled={!file}
            id="analyze-btn"
            aria-label="Analyze resume"
          >
            Analyze resume
            <ArrowRight size={18} />
          </button>

          <p className={styles.privacyNote}>
            Your resume is processed in memory only and never stored.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
