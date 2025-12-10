import React from "react";
import "../css/EventCard.css";
import testImage from "../assets/icons/sample.jpg";

const formatDate = (dateObj) => {
  if (!dateObj) return "Date not specified";
  if (dateObj.seconds) {
    return new Date(dateObj.seconds * 1000).toLocaleDateString();
  }
  return dateObj; // Fallback if it's already a string
};

export default function EventCard({event, onClick, userRole ,buttonText = "Register"}) {



  return (
    <div className="event-card">

        <div className="img-card">
        <img src={event.Image || testImage} />
      </div>
      
      <h3>{event.eventName}</h3>

      <p>
        <strong>Date:</strong> {formatDate(event.date)}
      </p>
      
      <p>
        <strong>Location:</strong> {event.universityId}
      </p>
      
      <p>{event.description}</p>

      <p> 
        <strong>Price:</strong> {event.price || "Free"}
      </p>

      {(userRole === "organizer" ||  userRole === "admin") && (
        <p>
          <strong>Status:</strong> {event.status}
        </p>
      )}

      <button
        className="auth-button"
        onClick={() => onClick(event)}
      >
        {buttonText}
      </button>
    </div>
  );
}
