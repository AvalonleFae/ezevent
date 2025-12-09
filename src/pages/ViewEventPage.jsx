import React from "react";
import EventsList from "../components/EventsList";
import { useAuth } from "../components/AuthContext"; // ⚠️ Double check this path! earlier you said "../context/AuthContext"

export default function ViewEventsPage() {

  const { user } = useAuth();

  const handleClick = async (event) => {
    // 🛑 SAFETY CHECK: Stop right here if no user is logged in
    if (!user) {
      alert("Please log in to register for this event.");
      // You could also redirect them to login page here: navigate('/login');
      return; 
    }

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
  }

  return (
    <div>
      <h1>View Events</h1>
      <EventsList
        collectionName="events"
        onClickAction={handleClick}
        ActionText="Register"
      />
    </div>
  )
}