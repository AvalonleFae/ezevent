import React from 'react'
import '../../css/OrganizerPage.css'
import EventsList from '../../components/EventsList'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../components/AuthContext'

export default function OrganizerPage() {

  const navigate = useNavigate();

  const { user } = useAuth()

  const handleGoToEventDashboard = (event) => {
    navigate(`/organizer/my-event/${event.id}/dashboard`);
  };

  return (
    <div className="organizer-page-root">
      <div className="organizer-header-section">
        <h1 className="tbhx-header">Organizer <span className="text-glow">Dashboard</span></h1>
        <div className="header-accent"></div>
      </div>

      <div className="organizer-main">
        <div className="section-title">
          <h2 className="tbhx-header">Active Events</h2>
        </div>
        <EventsList
          collectionName="events"
          onClickAction={handleGoToEventDashboard}
          ActionText="Manage Event"
          userRole="organizer"
          userId={user ? user.uid : ""}
        />
      </div>
    </div>
  )
}
