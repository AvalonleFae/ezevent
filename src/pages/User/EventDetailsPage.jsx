import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateObj) => {
    if (!dateObj) return "Date not specified";
    if (dateObj.seconds) {
      // Check if it's a Firestore Timestamp
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    }
    return dateObj;
  };

  // 1. Add handler function for the button
  const handleRegistration = () => {
      // Logic for handling the registration click goes here
      alert(`Initiating registration process for: ${event.eventName}`);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          setEvent({ id: eventSnap.id, ...eventSnap.data() });
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

  if (loading) return <p>Loading event details...</p>;
  if (!event) return <p>Event not found.</p>;

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
            {event.imageUrl && (
              <img
                src={event.imageUrl}
                alt={event.eventName}
                className="event-image"
              />
            )}

            <div className="event-category-box">
              <h3>Category</h3>
              <p>{event.category || "Category not specified"}</p>
            </div>

            <div className="event-name-box">
              <h3>Event Name</h3>
              <p>{event.eventName}</p>
            </div>  

            <div className="event-date-box">
              <h3>Date</h3>
              <p>{formatDate(event.date)}</p>
            </div>

            <div className="event-description-box">
              <h3>Description</h3>
              <p>{event.description}</p>
            </div>

            <div className="event-faculty-box">
              <h3>Faculty</h3>
              <p>{event.faculty || "Faculty not specified"}</p>
            </div>

            <div className="event-university-box">
              <h3>University</h3>
              <p>{event.university || "University not specified"}</p>
            </div> 
            
             <div className="event-price-box">
              <h3>Price</h3>
              <p>{event.price || "Price not specified"}</p>
            </div> 

            <div className="event-location-box">
              <h3>Location</h3>
              <p>{event.address || "Location not specified"}</p>
            </div>

          </div>
        </div>

        <button onClick={handleRegistration} className="register-event-button">
            Register for Event
        </button>

      </div>
    </div>
  );
}   