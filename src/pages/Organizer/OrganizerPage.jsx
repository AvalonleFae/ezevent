import React from 'react'
import Sidebar from '../../components/Sidebar'
import '../../css/OrganizerPage.css'
import EventsList from '../../components/EventsList'

export default function OrganizerPage() {
  return (
    <div className="organizer-container">
      <Sidebar role="organizer" />
      <main className="organizer-content">
        <div className="organizer-header">
          <div className="organizer-profile">
            <h1>OrganizerName</h1>
          </div>
          <div className="organizer-divider"></div>
        </div>

        <div className="organizer-main">
          <EventsList
            collectionName='events'
            onClickAction={(event) => { console.log("Event clicked:", event.id) }}
            ActionText="View Details"
         />
        </div>

        <div className="organizer-footer">
          <button className="create-event-btn">Create Event</button>
        </div>
      </main>
    </div>
  )
}
