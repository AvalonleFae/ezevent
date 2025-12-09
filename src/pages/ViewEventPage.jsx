import React from "react";
import EventsList from "../components/EventsList";
import { useNavigate } from "react-router-dom";

export default function ViewEventPage() { 

  const navigate = useNavigate();
  const handleClick = (event) => {
    console.log("Event clicked:", event.id);
    navigate(`/participant/events/${event.id}`);
  }
  return (
    <div>
      <h1>View Events</h1>
      <EventsList
        collectionName="events"
        onClickAction={handleClick}
        ActionText="View Event"
      />
    </div>
  )
}
