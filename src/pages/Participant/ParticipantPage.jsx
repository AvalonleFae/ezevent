import React from 'react'
import Sidebar from '../../components/Sidebar'
import '../css/AdminPage.css'

export default function ParticipantPage() {
  return (
    <div className="admin-container">
      <Sidebar role="participant" />
      <main className="admin-content">
        <h1>Add dashboard here</h1>
      </main>
    </div>
  )
}
