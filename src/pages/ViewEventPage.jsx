import React from "react";
import "../css/ParticipantPage.css"; // reuse your admin styles

// Sample events data
// const events = [
//   {
//     id: 1,
//     title: "Tech Talk 2025",
//     date: "2025-12-10",
//     location: "UKM Auditorium",
//     description: "Learn about latest AI and software trends.",
//   },
//   {
//     id: 2,
//     title: "Hackathon Challenge",
//     date: "2025-12-15",
//     location: "UPM Innovation Lab",
//     description: "Participate in a 24-hour coding challenge.",
//   },
//   {
//     id: 3,
//     title: "Startup Pitch Day",
//     date: "2025-12-20",
//     location: "UM Business Center",
//     description: "Showcase your startup idea to investors.",
//   },
// ];

export default function ViewEventsPage() {
  return (
    <div className="events-container">
      <h1>Available Events</h1>
      <div className="events-grid">
        {events.map((event) => (
          <div className="event-card" key={event.id}>
            <h3>{event.title}</h3>
            <p><strong>Date:</strong> {event.date}</p>
            <p><strong>Location:</strong> {event.location}</p>
            <p>{event.description}</p>
            <button className="auth-button">Register</button>
          </div>
        ))}
      </div>
    </div>
  );
}
