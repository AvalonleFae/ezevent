import React from "react";
import "../css/EventCard.css";
import testImage from "../assets/icons/event.jpg";

const formatDate = (dateObj) => {
  if (!dateObj) return "Date not specified";
  if (dateObj.seconds) {
    return new Date(dateObj.seconds * 1000).toLocaleDateString();
  }
  return dateObj; // Fallback if it's already a string
};

export default function EventCard({event, onClick, buttonText = "Register"}) {
  return (
    <div className="event-card">

        <div className="img-card">
        <img src={event.imageUrl || testImage} />
      </div>
      
      <h3>{event.eventName}</h3>

      <p>
        <strong>Date:</strong> {formatDate(event.date)}
      </p>
      
      <p>
        <strong>Location:</strong> {event.facultyid}
      </p>
      
      <p>{event.description}</p>

      <p> 
        <strong>Price:</strong> {event.price}
      </p>

      <button
        className="auth-button"
        onClick={() => onClick(event)}
      >
        {buttonText}
      </button>
    </div>
  );
}
