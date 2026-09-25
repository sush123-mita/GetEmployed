import { motion } from 'framer-motion'
import { ArrowRight, Zap, Target, BarChart3, Globe } from 'lucide-react'
import { useApp, VIEWS } from '../context/AppContext'
import styles from './LandingPage.module.css'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}
const stagger = { show: { transition: { staggerChildren: 0.1 } } }

const FEATURES = [
  { icon: <Zap size={20} />,      title: 'Instant parsing',        body: 'PDF or DOCX — text extracted in seconds, no manual input.' },
  { icon: <Target size={20} />,   title: 'Skill intelligence',     body: 'AI reads your resume and identifies every relevant skill and role.' },
  { icon: <Globe size={20} />,    title: 'Live job market',        body: 'Real listings from multiple job APIs, searched simultaneously.' },
  { icon: <BarChart3 size={20} />,title: 'Match scoring',          body: 'Every job is ranked by how well it aligns with your exact profile.' },
]

const STEPS = [
  { num: '01', title: 'Upload your resume', body: 'Drag-and-drop or browse. PDF and DOCX supported.' },
  { num: '02', title: 'AI reads your profile', body: 'Skills, experience, and role are extracted automatically.' },
  { num: '03', title: 'Live jobs are fetched', body: 'Real openings from multiple APIs — no outdated listings.' },
  { num: '04', title: 'See your matches', body: 'Jobs ranked by relevance, with matched skills highlighted.' },
]

export default function LandingPage() {
  const { navigate } = useApp()

  return (
    <div className={styles.page}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className={styles.landingNav}>
        <div className={`container ${styles.navInner}`}>
          <div className={styles.navLogo}>
            <span className={styles.navLogoIcon}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </span>
            <span className={styles.navLogoText}>Get<strong>Employed</strong></span>
          </div>
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => navigate(VIEWS.UPLOAD)}
            id="landing-nav-upload"
          >
            Get started
          </button>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={`container container--narrow ${styles.heroContent}`}>
          <motion.div
            className={styles.heroInner}
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUp} className={styles.eyebrow}>
              <span className="badge badge--accent">
                <Zap size={10} />
                AI-powered job matching
              </span>
            </motion.div>

            <motion.h1 variants={fadeUp} className={`display ${styles.heroTitle}`}>
              Stop searching.<br />
              Let your resume<br />
              <span className={styles.heroAccent}>find the jobs.</span>
            </motion.h1>

            <motion.p variants={fadeUp} className={styles.heroSubtitle}>
              Upload your resume once. GetEmployed reads your profile,
              scours live job listings, and shows you real openings ranked
              by how well they match — skills, role, and experience level.
            </motion.p>

            <motion.div variants={fadeUp} className={styles.heroCta}>
              <button
                className={`btn btn--primary btn--lg ${styles.primaryCta}`}
                onClick={() => navigate(VIEWS.UPLOAD)}
                id="hero-upload-cta"
              >
                Analyze my resume
                <ArrowRight size={18} />
              </button>
              <p className={styles.heroNote}>
                Free to use · No account required · PDF or DOCX
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* subtle grid background */}
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className={styles.features}>
        <div className="container">
          <motion.div
            className={styles.featuresGrid}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className={`card ${styles.featureCard}`}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureBody}>{f.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className={styles.how}>
        <div className="container container--narrow">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className={styles.sectionHeader}>
              <span className="label">How it works</span>
              <h2 className={`headline ${styles.sectionTitle}`}>From resume to ranked matches in under a minute</h2>
            </motion.div>

            <div className={styles.steps}>
              {STEPS.map((step, i) => (
                <motion.div key={step.num} variants={fadeUp} className={styles.step}>
                  <div className={styles.stepNum}>{step.num}</div>
                  <div className={styles.stepContent}>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepBody}>{step.body}</p>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={styles.stepConnector} aria-hidden="true" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA banner ──────────────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className="container container--narrow">
          <motion.div
            className={styles.ctaInner}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className={styles.ctaTitle}>Ready to find your next role?</h2>
            <p className={styles.ctaBody}>Upload your resume and get ranked job matches in seconds.</p>
            <button
              className={`btn btn--primary btn--lg`}
              onClick={() => navigate(VIEWS.UPLOAD)}
              id="cta-banner-upload"
            >
              Get started — it's free
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className="container">
          <p className={styles.footerText}>
            © {new Date().getFullYear()} GetEmployed · Jobs sourced from Adzuna & Jooble · No data stored
          </p>
        </div>
      </footer>
    </div>
  )
}
