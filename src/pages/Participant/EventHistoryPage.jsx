import React, { useState } from "react";
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/ParticipantPage.css";

export default function EventHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State to manage the filter (default to 'upcoming')
  const [filterType, setFilterType] = useState("upcoming");

  const handleClick = (event) => {
    navigate(`/participant/history/receipt/${event.id}`);
  };

  return (
    <div className="history-page-root">
      <div className="participant-header">
        <h1 className="tbhx-header">EVENT <span className="text-glow-part">HISTORY</span></h1>
        <div className="header-accent"></div>
      </div>

      <div className="filter-container">
        <button
          className={`tbhx-button ${filterType === "upcoming" ? "" : "secondary"}`}
          onClick={() => setFilterType("upcoming")}
        >
          UPCOMING EVENTS
        </button>
        <button
          className={`tbhx-button ${filterType === "past" ? "" : "secondary"}`}
          onClick={() => setFilterType("past")}
        >
          ARCHIVED EVENTS
        </button>
      </div>

      <div className="participant-main">
        <EventsList
          collectionName="events"
          onClickAction={handleClick}
          ActionText="VIEW DETAILS"
          userRole="participant"
          userId={user ? user.uid : ""}
          timeFilter={filterType}
        />
      </div>
    </div>
  );
}