import React from "react";
import EventsList from "../components/EventsList";
<<<<<<< HEAD
import { useNavigate } from "react-router-dom";

export default function ViewEventPage() { 

  const navigate = useNavigate();
  const handleClick = (event) => {
    console.log("Event clicked:", event.id);
    navigate(`/participant/events/${event.id}`);
=======
import { useAuth } from "../components/AuthContext"; // ⚠️ Double check this path! earlier you said "../context/AuthContext"

export default function ViewEventsPage() {

  const { user } = useAuth();

  const handleClick = async (event) => {

    try {
      console.log("Initiating payment...");

      // Your deployed Function URL
      const functionUrl = "https://us-central1-ezevent-b494c.cloudfunctions.net/createStripeCheckout";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: user.uid,     // Now safe because we checked 'user' above
          userEmail: user.email 
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; 
      } else {
        console.error("No URL returned from backend");
        alert("Payment system is currently down.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Could not connect to payment server.");
    }
>>>>>>> d721474ff29d7c3a5ab174bbcf9f747bc3539d31
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