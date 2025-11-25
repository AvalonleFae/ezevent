import './App.css'
import AdminPage from './pages/AdminPage'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import LandingPage from './pages/LandingPage' 
import { useAuth } from './components/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import ParticipantPage from './pages/ParticipantPage'
import OrganizerPage from './pages/OrganizerPage'
import CreateEvent from './pages/create_event.jsx'
import ValidateOrganizerPage from './pages/ValidateOrganizerPage'

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
    <CreateEvent />
  )
}

export default App
