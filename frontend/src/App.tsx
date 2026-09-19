import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { usePatientStore } from '@/store/patientStore'

// Layout
import AppLayout from '@/components/layout/AppLayout'

// Pages
import LandingPage from '@/pages/Landing/LandingPage'
import LoginPage from '@/pages/Auth/LoginPage'
import RegisterPage from '@/pages/Auth/RegisterPage'
import DashboardPage from '@/pages/Dashboard/DashboardPage'
import UploadPage from '@/pages/Upload/UploadPage'
import VerificationPage from '@/pages/Verification/VerificationPage'
import TimelinePage from '@/pages/Timeline/TimelinePage'
import LabsPage from '@/pages/Labs/LabsPage'
import MedicationsPage from '@/pages/Medications/MedicationsPage'
import DiagnosesPage from '@/pages/Diagnoses/DiagnosesPage'
import ProceduresPage from '@/pages/Procedures/ProceduresPage'
import AISearchPage from '@/pages/Search/AISearchPage'
import DocumentsPage from '@/pages/Documents/DocumentsPage'
import SettingsPage from '@/pages/Settings/SettingsPage'

// Demo login auto-redirect
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function DemoLoginRedirect() {
  const { setAuth } = useAuthStore()
  const { setCurrentPatient } = usePatientStore()
  const navigate = useNavigate()

  useEffect(() => {
    // Set demo auth
    setAuth(
      { id: 1, name: 'Dr. Demo User', email: 'demo@meditimeline.ai', role: 'doctor' },
      'demo-token-for-hackathon'
    )
    setCurrentPatient({
      id: 1,
      name: 'Ravi Kumar',
      date_of_birth: '1978-06-15',
      gender: 'Male',
      blood_group: 'B+',
      phone: '+91 98765 43210',
      email: 'ravi.kumar@email.com'
    })
    navigate('/dashboard', { replace: true })
  }, [])

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-teal-400">Loading demo...</p>
      </div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/demo-login" element={<DemoLoginRedirect />} />

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/verify/:id" element={<VerificationPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/medications" element={<MedicationsPage />} />
        <Route path="/diagnoses" element={<DiagnosesPage />} />
        <Route path="/procedures" element={<ProceduresPage />} />
        <Route path="/search" element={<AISearchPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
