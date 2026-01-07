
import React, { useState } from 'react'
import '../../css/OrganizerPage.css'
import EventsList from '../../components/EventsList'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../components/AuthContext'

export default function OrganizerPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [filterType, setFilterType] = useState("all");

  const handleGoToEventDashboard = (event) => {
    navigate(`/organizer/my-event/${event.id}/dashboard`);
  };

  return (
    <div className="organizer-page-root">
      <div className="organizer-header-section">
        <h1 className="tbhx-header">
          Organizer <span className="text-glow-org">Dashboard</span>
        </h1>
        <div className="header-accent"></div>
      </div>

      <div className="organizer-main">
        <div className="section-title">
          <h2 className="tbhx-header">My Events</h2>
        </div>

        <div className="filter-container" role="group" aria-label="Filter events">
          <button
            type="button"
            className={`tbhx-button ${filterType === "all" ? "" : "secondary"}`}
            onClick={() => setFilterType("all")}
            aria-pressed={filterType === "all"}
          >
            ALL EVENTS
          </button>

          <button
            type="button"
            className={`tbhx-button ${filterType === "upcoming" ? "" : "secondary"}`}
            onClick={() => setFilterType("upcoming")}
            aria-pressed={filterType === "upcoming"}
          >
            UPCOMING EVENTS
          </button>

          <button
            type="button"
            className={`tbhx-button ${filterType === "past" ? "" : "secondary"}`}
            onClick={() => setFilterType("past")}
            aria-pressed={filterType === "past"}
          >
            PAST EVENTS
          </button>
        </div>

        <EventsList
          collectionName="events"
          onClickAction={handleGoToEventDashboard}
          ActionText="Manage Event"
          userRole="organizer"
          userId={user ? user.uid : ""}
          timeFilter={filterType}
        />
      </div>
    </div>
  );
}
