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

    <>
      <div className="organizer-header">
        <div className="organizer-profile">
          <h1>My Events</h1>
        </div>
        <div className="organizer-divider"></div>
      </div>

      <div className="organizer-main">
        <EventsList
          collectionName="events"
          onClickAction={handleGoToEventDashboard}
          ActionText="View Details"
          userRole="organizer"
          userId={user ? user.uid : ""}
        />
      </div>
    </>

  )
}
