import './App.css'
import AdminPage from './pages/AdminPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import LandingPage from './pages/LandingPage'
import { useAuth } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import OrganizerPage from './pages/OrganizerPage'
import AdminLayout from './layouts/AdminLayout'
import ParticipantsLayout from './layouts/ParticipantLayout'

function App() {
  const { user, role, loading } = useAuth()

  const getLandingPath = () => {
    if (role === 'participant') return '/participant/home'
    if (role === 'organizer') return '/organizer'
    if (role === 'admin') return '/admin'
    return '/' // Return to landing page if role is not set
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <ParticipantsLayout />
    </Router>
  )
}

export default App
