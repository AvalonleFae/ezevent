import React, { useEffect, useState } from "react";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../../firebase";
import "../../css/EventDetailsPage.css";
import { useAuth } from "../../components/AuthContext";

export default function EventDetailsPage() {
    const [attendanceStatus, setAttendanceStatus] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To detect if we are in 'history' mode

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const { user } = useAuth();

  // Check if the current URL contains 'history' or 'receipt'
  const isHistoryMode = location.pathname.includes("history") || location.pathname.includes("receipt");

  const formatDate = (dateObj, endDateObj) => {
    if (!dateObj) return "DATE NOT SPECIFIED";

    const start = dateObj.seconds ? new Date(dateObj.seconds * 1000) : new Date(dateObj);
    const end = endDateObj ? (endDateObj.seconds ? new Date(endDateObj.seconds * 1000) : new Date(endDateObj)) : null;

    if (!end || start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString();
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        // 1. Fetch Event Details
        const eventRef = doc(db, "events", id);
        const eventSnap = await getDoc(eventRef);

        if (eventSnap.exists()) {
          const rawEvent = { id: eventSnap.id, ...eventSnap.data() };

          // 2. Fetch Registration Count for this Event
          const regQuery = query(collection(db, "registrations"), where("eventId", "==", id));
          const regSnap = await getDocs(regQuery);
          setRegistrationCount(regSnap.size); // Set the count based on number of docs

          const catId = rawEvent.categoryId;
          const uniId = rawEvent.universityId;
          const facId = rawEvent.facultyId;

          let categoryDisplay = "SECTOR UNKNOWN";
          let uniDisplay = "LOCATION UNKNOWN";
          let facultyDisplay = "FACULTY UNKNOWN";

          // Fetch Category
          if (catId) {
            const catSnap = await getDoc(doc(db, "eventCategories", catId));
            if (catSnap.exists()) categoryDisplay = catSnap.data().categoryName;
          }

          // Fetch University
          if (uniId) {
            const uniSnap = await getDoc(doc(db, "universities", uniId));
            if (uniSnap.exists()) uniDisplay = uniSnap.data().universityName;
          }

          // Fetch Faculty
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

          // Fetch attendance status for this user (if in history/receipt mode)
          if (user && (location.pathname.includes("history") || location.pathname.includes("receipt"))) {
            // Find registration for this user and event
            const userRegQuery = query(
              collection(db, "registrations"),
              where("userId", "==", user.uid),
              where("eventId", "==", id)
            );
            const userRegSnap = await getDocs(userRegQuery);
            if (!userRegSnap.empty) {
              const regDoc = userRegSnap.docs[0];
              const attendanceRef = collection(db, "registrations", regDoc.id, "attendance");
              const attendanceSnap = await getDocs(attendanceRef);
              if (!attendanceSnap.empty) {
                // If multiple, show the first present, else the first status
                const presentDoc = attendanceSnap.docs.find(attDoc => attDoc.data().status === "present");
                if (presentDoc) {
                  setAttendanceStatus("Present");
                } else {
                  // Show the first status found
                  setAttendanceStatus(attendanceSnap.docs[0].data().status || "Unknown");
                }
              } else {
                setAttendanceStatus("Not Marked");
              }
            } else {
              setAttendanceStatus("Not Registered");
            }
          }

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
    // Only re-run when id, user, or location changes
  }, [id, user, location.pathname]);

  // Determine if event is full
  const maxParticipants = event?.numOfParticipants || 0;
  const isFull = maxParticipants > 0 && registrationCount >= maxParticipants;
  const registrationOpen = event?.registrationOpen || false;
  const canRegister = registrationOpen && !isFull;

  const handleRegistration = async () => {
    if (!user) {
      alert("UNAUTHORIZED ACCESS. PLEASE LOG IN.");
      return;
    }

    // BLOCKER: Check if registration is open
    if (!registrationOpen) {
      alert("REGISTRATION FAILED: REGISTRATION IS NOT OPEN YET.");
      return;
    }

    // BLOCKER: Check if full before proceeding
    if (isFull) {
      alert("REGISTRATION FAILED: EVENT CAPACITY REACHED.");
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
        alert("SYSTEM ERROR: " + response.statusText);
        return;
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("PAYMENT PROTOCOL OFFLINE.");
      }
    } catch (error) {
      alert("CONNECTION FAILURE.");
    }
  };


  const handleViewReceipt = () => {
    navigate(`/participant/history/receipt/ticket/${id}`);
  };

  const nextImg = () => {
    if (!event.images || event.images.length === 0) return;
    setCurrentImgIndex((prev) => (prev + 1) % event.images.length);
  };

  const prevImg = () => {
    if (!event.images || event.images.length === 0) return;
    setCurrentImgIndex((prev) => (prev - 1 + event.images.length) % event.images.length);
  };

  if (loading) return (
    <div className="event-details-loading">
      <div className="halftone-bg"></div>
      <div className="loading-glitch">INCOMING DATA...</div>
    </div>
  );

  if (!event) return (
    <div className="event-details-error">
      <div className="halftone-bg"></div>
      <div className="error-glitch">SECTOR VOID. EVENT NOT FOUND.</div>
      <button onClick={() => navigate(-1)} className="tbhx-button">RETURN</button>
    </div>
  );

  return (
    <div className="ed-root">
      <div className="halftone-bg"></div>

      <div className="top-actions-bar">
        <button onClick={() => navigate(-1)} className="tbhx-button secondary back-button">
          &larr; BACK
        </button>
      </div>

      <div className="ed-header">
        <h1 className="tbhx-header"><span className="text-glow">{event.eventName}</span></h1>
        <div className="header-accent"></div>
      </div>

      <div className="ed-layout-stacked">
        {/* Top Media Section: Gallery/Carousel */}
        <div className="ed-media-section-top">
          {event.images && event.images.length > 0 ? (
            <div className="ed-carousel-container">
              <div className="ed-carousel-stage">
                <img
                  src={event.images[currentImgIndex]}
                  alt={event.eventName}
                  className="ed-main-image-hero"
                />
                <div className="image-glitch-overlay-hero"></div>

                {event.images.length > 1 && (
                  <>
                    <button className="carousel-nav-btn prev" onClick={prevImg}>&#10094;</button>
                    <button className="carousel-nav-btn next" onClick={nextImg}>&#10095;</button>
                    <div className="carousel-dots">
                      {event.images.map((_, idx) => (
                        <span
                          key={idx}
                          className={`dot ${idx === currentImgIndex ? 'active' : ''}`}
                          onClick={() => setCurrentImgIndex(idx)}
                        ></span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : event.Image ? (
            <div className="ed-image-container-hero">
              <img src={event.Image} alt={event.eventName} className="ed-main-image-hero" />
            </div>
          ) : (
            <div className="ed-image-placeholder-hero">NO VISUAL DATA</div>
          )}
        </div>

        {/* Content Sections Below Image */}
        <div className="ed-content-grid">
          {/* Left Column: Price & Registration */}
          <div className="ed-primary-col">
            <div className="ed-price-tag-v2 tbhx-card">
              <span className="price-label">ENTRY CREDIT</span>
              <span className="price-amount text-glow-cyan">
                {event.price ? `RM ${event.price}` : "FREE"}
              </span>
            </div>

            <div className="tbhx-card description-card">
              <span className="ed-label">DESCRIPTION</span>
              <p className="ed-description">{event.description}</p>
            </div>
          </div>

          {/* Right Column: Event Intel/Details */}
          <div className="ed-secondary-col">
            <div className="tbhx-card ed-info-card">
              <div className="ed-row">
                <span className="ed-label">STATUS</span>
                <span className={`ed-value ${!registrationOpen ? 'text-glow-org' : (isFull ? 'text-glow-red' : 'text-glow')}`}>
                  {!registrationOpen ? "REGISTRATION CLOSED" : (isFull ? "SOLD OUT" : "ACTIVE")}
                </span>
              </div>
              <div className="ed-row">
                <span className="ed-label">SLOTS TAKEN</span>
                <span className="ed-value">
                  {registrationCount} / {event.numOfParticipants}
                </span>
              </div>
              <div className="ed-row">
                <span className="ed-label">CATEGORY</span>
                <span className="ed-value">{event.categoryName.toUpperCase()}</span>
              </div>
              <div className="ed-row">
                <span className="ed-label">EVENT DATE</span>
                <span className="ed-value">{formatDate(event.startDate || event.date, event.endDate)}</span>
              </div>
              <div className="ed-row">
                <span className="ed-label">LOCATION</span>
                <span className="ed-value">{event.universityName.toUpperCase()}</span>
              </div>
              <div className="ed-row">
                <span className="ed-label">FACULTY</span>
                <span className="ed-value">{event.facultyName.toUpperCase()}</span>
              </div>
              <div className="ed-row">
                <span className="ed-label">ADDRESS</span>
                <span className="ed-value">{event.address || "SECTOR UNKNOWN"}</span>
              </div>
            </div>

            {/* Action Buttons Moved Here */}
            {isHistoryMode ? (
              <div className="tbhx-card message-card">
                <span className="ed-label">POST-REGISTRATION INTEL</span>
                <p className="ed-message">{event.afterRegistrationMessage || "NO ADDITIONAL INTEL."}</p>
                <div className="ed-action-group">
                  <button onClick={handleViewReceipt} className="tbhx-button ed-action-btn">
                    VIEW TICKET & RECEIPT
                  </button>
                  {event.reviewOpen && (
                    <button
                      onClick={() => navigate(`/participant/history/review/${id}`)}
                      className="tbhx-button ed-action-btn review-btn"
                      style={{ marginTop: '1rem', background: 'linear-gradient(135deg, #4f46e5, #ec4899)', color: 'white' }}
                    >
                      REVIEW EVENT
                    </button>
                  )}
                </div>
                {/* Attendance Status Display */}
                <div className="attendance-status-row" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <span className="ed-label">ATTENDANCE STATUS:</span>
                  <span className="ed-value" style={{ marginLeft: 8, fontWeight: 600, color: attendanceStatus === 'Present' ? '#22c55e' : '#f59e42' }}>
                    {attendanceStatus || 'Loading...'}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={handleRegistration}
                disabled={!canRegister}
                className={`tbhx-button ed-action-btn ${!canRegister ? 'disabled-btn' : 'register-now'}`}
              >
                {!registrationOpen ? "REGISTRATION NOT OPEN" : (isFull ? "EVENT FULL / SOLD OUT" : "REGISTER FOR EVENT")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}