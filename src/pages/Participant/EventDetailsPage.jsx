import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";
import { useAuth } from "../../components/AuthContext"; 

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user from your Auth Context
  const { user } = useAuth();

  const formatDate = (dateObj) => {
    if (!dateObj) return "Date not specified";
    // Handle Firestore Timestamp
    if (dateObj.seconds) {
      return new Date(dateObj.seconds * 1000).toLocaleDateString();
    }
    // Handle standard Date string or object
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
          
          // --- DEBUGGING LOGS ---
          console.log("Fetched Event Data:", rawEvent);
          console.log("Category Field:", rawEvent.category);
          console.log("University Field:", rawEvent.university);
          console.log("Faculty Field:", rawEvent.faculty);
          // ----------------------

          let categoryDisplay = rawEvent.category || "Category not specified";
          let uniDisplay = rawEvent.university || "University not specified";
          let facultyDisplay = rawEvent.faculty || "Faculty not specified";

          // 1. Fetch Category Name
          if (rawEvent.categoryId) {
            try {
                // Ensure this matches your DB collection name exactly
                const catSnap = await getDoc(doc(db, "eventCategories", rawEvent.categoryId));
                if (catSnap.exists()) {
                    categoryDisplay = catSnap.data().categoryName;
                }
            } catch (err) { console.error("Error fetching category:", err); }
          }

          // 2. Fetch University Name
          if (rawEvent.universityId) {
            try {
                const uniSnap = await getDoc(doc(db, "universities", rawEvent.universityId));
                if (uniSnap.exists()) {
                    uniDisplay = uniSnap.data().universityName;
                }
            } catch (err) { console.error("Error fetching university:", err); }
          }

          // 3. Fetch Faculty Name
          if (rawEvent.universityId && rawEvent.facultyId) {
            try {
                // Note: The structure here assumes 'faculties' is a SUB-COLLECTION of the specific university
                const facRef = doc(db, "universities", rawEvent.universityId, "faculties", rawEvent.facultyId);
                const facSnap = await getDoc(facRef);
                
                if (facSnap.exists()) {
                    facultyDisplay = facSnap.data().facultyName;
                } else {
                    console.log("Faculty document not found at path:", facRef.path);
                }
            } catch (err) { console.error("Error fetching faculty:", err); }
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
      console.log("Initiating payment for Event ID:", event.id);

      // Verify this URL matches your deployed Cloud Function
      const functionUrl = "https://us-central1-ezevent-b494c.cloudfunctions.net/createStripeCheckout";

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: event.id,
          userId: user.uid,
          userEmail: user.email
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No URL returned from backend", data);
        alert("Payment system is currently unavailable.");
      }

    } catch (error) {
      console.error("Payment Error:", error);
      alert("Could not connect to payment server.");
    }
  }

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

            <div className="info-row">
              <h3>Category</h3>
              {/* Display the resolved name */}
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
              {/* Display the resolved name */}
              <p>{event.facultyName}</p>
            </div>

            <div className="info-row">
              <h3>University</h3>
              {/* Display the resolved name */}
              <p>{event.universityName}</p>
            </div>

            <div className="info-row">
              <h3>Price</h3>
              {/* Added currency manually since it wasn't in the event object, update if needed */}
              <p>{event.price ? `RM ${event.price}` : "Price not specified"}</p>
            </div>

            <div className="info-row">
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