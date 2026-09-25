import { AnimatePresence } from 'framer-motion'
import { AppProvider, useApp, VIEWS } from './context/AppContext'
import LandingPage from './pages/LandingPage'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultsPage from './pages/ResultsPage'
import JobDetailPage from './pages/JobDetailPage'
import SavedJobsPage from './pages/SavedJobsPage'
import Navbar from './components/Navbar'

function Router() {
  const { view } = useApp()

  const pages = {
    [VIEWS.LANDING]:    <LandingPage />,
    [VIEWS.UPLOAD]:     <UploadPage />,
    [VIEWS.PROCESSING]: <ProcessingPage />,
    [VIEWS.RESULTS]:    <ResultsPage />,
    [VIEWS.JOB_DETAIL]: <JobDetailPage />,
    [VIEWS.SAVED]:      <SavedJobsPage />,
  }

  const hideNav = view === VIEWS.PROCESSING || view === VIEWS.LANDING

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNav && <Navbar />}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          <div key={view}>
            {pages[view] ?? <LandingPage />}
          </div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
