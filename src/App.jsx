import './App.css'
import AdminPage from './pages/Admin/AdminPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/User/LoginPage'
import SignUpPage from './pages/User/SignUpPage'
import LandingPage from './pages/User/LandingPage'
import { useAuth } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import ParticipantsLayout from './layouts/ParticipantLayout'
import OrganizerLayout from './layouts/OrganizerLayout'

function App() {
  const { user, role, loading } = useAuth()

  const getLandingPath = () => {
    if (role === 'participant') return '/participant'
    if (role === 'organizer') return '/organizer'
    if (role === 'admin') return '/admin'
    return '/'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<LandingPage />}
        />
        
        <Route
          path="/login"
          element={
            user && role ? (
              <Navigate to={getLandingPath()} replace />
            ) : (
              <div className="app auth-wrapper">
                <div className="auth-inner">
                  <LoginPage />
                </div>
              </div>
            )
          }
        />

        <Route 
          path="/signup" 
          element={
            <div className="app auth-wrapper">
              <div className="auth-inner">
                <SignUpPage />
              </div>
            </div>
          } 
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/participant/*"
          element={
            <ProtectedRoute allowedRoles={['participant']}>
              <ParticipantsLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/organizer/*"
          element={
            <ProtectedRoute allowedRoles={['organizer']}>
              <OrganizerLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
