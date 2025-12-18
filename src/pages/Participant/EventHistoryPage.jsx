import React, { useState } from "react"; // Import useState
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../css/EventDetailsPage.css";

export default function EventHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State to manage the filter (default to 'upcoming')
  const [filterType, setFilterType] = useState("upcoming");

  const handleClick = (event) => {
    navigate(`/participant/history/receipt/${event.id}`);
  };

  // Simple inline styles for the toggle buttons
  const styles = {
    filterContainer: {
      display: "flex",
      gap: "10px",
      marginBottom: "20px",
      padding: "0 20px"
    },
    button: (isActive) => ({
      padding: "8px 16px",
      cursor: "pointer",
      backgroundColor: isActive ? "#007bff" : "#f0f0f0",
      color: isActive ? "#fff" : "#333",
      border: "1px solid #ccc",
      borderRadius: "5px",
      fontWeight: "bold"
    })
  };

  return (
    <div className="participant-container">
      <main className="participant-content">
        <div className="participant-header">
          <div className="participant-profile">
            <h1>My Event History</h1>
          </div>
          <div className="participant-divider"></div>
        </div>

        <div style={styles.filterContainer}>
          <button
            className={`history-filter-btn ${filterType === "upcoming" ? "active" : ""}`}
            onClick={() => setFilterType("upcoming")}
          >
            Upcoming Events
          </button>
          <button
            className={`history-filter-btn ${filterType === "past" ? "active" : ""}`}
            onClick={() => setFilterType("past")}
          >
            Past Events
          </button>
        </div>

        <div className="participant-main">
          <EventsList
            collectionName="events"
            onClickAction={handleClick}
            ActionText="View Details"
            userRole="participant"
            userId={user ? user.uid : ""}
            timeFilter={filterType} // Pass the filter state prop
          />
        </div>
      </main>
    </div>
  );
}