import './App.css'
import AdminPage from './pages/AdminPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import { useAuth } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ParticipantPage from './pages/ParticipantPage'

function App() {
  const { user, role, loading } = useAuth()

  const getLandingPath = () => {
    if (role === 'participant') return '/participant'
    if (role === 'organizer') return '/organizer'
    return '/admin'
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <div className="app">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to={getLandingPath()} /> : <LoginPage />}
              />
              
              <Route
                path="/login"
                element={user ? <Navigate to={getLandingPath()} /> : <LoginPage />}
              />

              <Route 
              path="/signup" 
              element={<SignUpPage />} 
              />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/participant"
                element={
                  <ProtectedRoute allowedRoles={['participant']}>
                    <ParticipantPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
