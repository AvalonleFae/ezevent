import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import { Routes, Route } from 'react-router-dom'
import OrganizerPage from '../pages/Organizer/OrganizerPage'
import EventDashboard from '../pages/Organizer/EventDashboard'
import CreateEvent from '../pages/Organizer/CreateEventPage'
import Report from '../pages/Organizer/Report'
import Chat from '../pages/Organizer/OrganizerChatList'
import AttendanceList from '../pages/Organizer/AttendanceList'
import EventChat from '../pages/Participant/EventChat'
import '../css/OrganizerPage.css'

function OrganizerLayout() {
  return (
    <div className="organizer-container app-layout theme-organizer">
      <Sidebar role="organizer" />

      <div className="organizer-content main-content">
        <Routes>
          <Route path="" element={<OrganizerPage />} />
          <Route path="my-events" element={<OrganizerPage />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="my-event/:id/dashboard" element={<EventDashboard />} />
          <Route path="my-event/:id/attendance-list" element={<AttendanceList />} />
          <Route path="my-event/:id/report" element={<Report />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat/:eventId" element={<EventChat />} />
        </Routes>
      </div>
    </div>
  )
}

export default OrganizerLayout
