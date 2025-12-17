import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";
import { useAuth } from "../../components/AuthContext";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To detect if we are in 'history' mode

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Check if the current URL contains 'history' or 'receipt'
  const isHistoryMode = location.pathname.includes("history") || location.pathname.includes("receipt");

  const formatDate = (dateObj) => {
    if (!dateObj) return "Date not specified";
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    }
    return new Date(dateObj).toLocaleDateString();
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          const rawEvent = { id: eventSnap.id, ...eventSnap.data() };

          const catId = rawEvent.categoryId;
          const uniId = rawEvent.universityId;
          const facId = rawEvent.facultyId;

          let categoryDisplay = "Category not specified";
          let uniDisplay = "University not specified";
          let facultyDisplay = "Faculty not specified";

          // 1. Fetch Category
          if (catId) {
            const catSnap = await getDoc(doc(db, "eventCategories", catId));
            if (catSnap.exists()) categoryDisplay = catSnap.data().categoryName;
          }

          // 2. Fetch University
          if (uniId) {
            const uniSnap = await getDoc(doc(db, "universities", uniId));
            if (uniSnap.exists()) uniDisplay = uniSnap.data().universityName;
          }

          // 3. Fetch Faculty
          if (uniId && facId) {
            const facRef = doc(db, "universities", uniId, "faculties", facId);
            const facSnap = await getDoc(facRef);
            if (facSnap.exists()) facultyDisplay = facSnap.data().facultyName;
          }

          setEvent({
            ...rawEvent,
            categoryName: categoryDisplay,
            universityName: uniDisplay,
            facultyName: facultyDisplay
          });

        } else {
          setEvent(null);
        }
      } catch (error) {
        console.error("Failed to load event:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegistration = async () => {
    if (!user) {
      alert("You must be logged in to register.");
      return;
    }

    try {
      const functionUrl = "https://us-central1-ezevent-b494c.cloudfunctions.net/createStripeCheckout";
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: event.price || 0,
          eventId: event.id,
          userId: user.uid,
          userEmail: user.email
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        alert("Server error: " + response.statusText);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Payment system is currently unavailable.");
      }
    } catch (error) {
      alert("Could not connect to payment server.");
    }
  };

  // Navigates to the actual ticket/receipt view
  const handleViewReceipt = () => {
    navigate(`/participant/history/receipt/ticket/${id}`);
  };

  if (loading) return <p className="loading-text">Loading event details...</p>;
  if (!event) return <p className="error-text">Event not found.</p>;

  return (
    <div className="event-details-page-container">
      <div className="event-details-card">

        <div className="top-actions-bar">
          <button onClick={() => navigate(-1)} className="back-button">
            ⬅ Back
          </button>
        </div>

        <h1>{event.eventName}</h1>

        <div className="event-content-grid">
          <div className="main-info">
            {event.Image && (
              <img
                src={event.Image}
                alt={event.eventName}
                className="event-image"
              />
            )}

            <div className="info-row">
              <h3>Category</h3>
              <p>{event.categoryName}</p>
            </div>

            <div className="info-row">
              <h3>Event Name</h3>
              <p>{event.eventName}</p>
            </div>

            <div className="info-row">
              <h3>Date</h3>
              <p>{formatDate(event.date)}</p>
            </div>

            <div className="info-row">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>

            <div className="info-row">
              <h3>Faculty</h3>
              <p>{event.facultyName}</p>
            </div>

            <div className="info-row">
              <h3>University</h3>
              <p>{event.universityName}</p>
            </div>

            <div className="info-row">
              <h3>Price</h3>
              <p>{event.price ? `RM ${event.price}` : "Price not specified"}</p>
            </div>

            <div className="info-row">
              <h3>Location</h3>
              <p>{event.address || "Location not specified"}</p>
            </div>
          </div>
        </div>

        {isHistoryMode ? (
          <div className="info-row">
            <h3>Important Message for Registered Participants</h3>
            <p>{event.afterRegistrationMessage   || "Location not specified"}</p>
            <button onClick={handleViewReceipt} className="register-event-button" style={{ backgroundColor: '#283fa7ff' }}>
              View Official Receipt & Ticket
            </button>
          </div>

        ) : (
          <button onClick={handleRegistration} className="register-event-button">
            Register for Event
          </button>
        )}

      </div>
    </div>
  );
}