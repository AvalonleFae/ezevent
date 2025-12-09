import React from "react";
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";

export default function ParticipantPage() {

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
  }

  return (
    <div className="participant-container">
      <main className="participant-content">
        <div className="participant-header">
          <div className="participant-profile">
            <h1>Public Events</h1>
          </div>
          <div className="participant-divider"></div>
        </div>

        <div className="participant-main">
          <EventsList
            collectionName="events"
            onClickAction={handleClick}
            ActionText="Register"
          />
        </div>
      </main>
    </div>
  )

}