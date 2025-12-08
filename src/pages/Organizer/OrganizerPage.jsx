import React from 'react'
import Sidebar from '../../components/Sidebar'
import '../css/AdminPage.css'

export default function OrganizerPage() {
  return (
    <div className="admin-container">
      <Sidebar role="organizer" />
      <main className="admin-content">
        <h1>Add dashboard here</h1>
      </main>
    </div>
  )
}
