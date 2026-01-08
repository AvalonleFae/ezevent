import React from "react";
import "../css/EventCard.css";
import testImage from "../assets/icons/sample.jpg";

export default function EventCard({ event, onClick, userRole, buttonText = "Register", index = 0, variant = "vertical", type = "event" }) {
  const dateObj = event.date?.seconds ? new Date(event.date.seconds * 1000) : new Date();
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  const colors = ['color-grey', 'color-blue', 'color-pink', 'color-lilac', 'color-mint', 'color-peach'];
  const colorIndex = index % colors.length;
  const colorClass = colors[colorIndex];

  const isFeature = type === "feature";
  const isVintage = variant === "vintage";

  const handleButtonClick = (e) => {
    e.stopPropagation(); // Prevent card click
    if (onClick) onClick(event);
  };

  return (
    <div className={`majestic-ticket ${colorClass} ${variant} ${isFeature ? 'feature-card' : ''}`} onClick={isFeature ? () => onClick && onClick(event) : undefined}>
      {isFeature ? (
        <div className={`feature-card-inner ${isVintage ? 'vintage-feature-inner' : ''}`}>
          <div className="ticket-header">
            <div className="feature-emoji-container">
              <span className="feature-emoji">{event.emoji}</span>
            </div>
          </div>
          <div className="ticket-body">
            <div className="feature-section-row">
              <span className="row-label">NAME</span>
              <h2 className="ticket-main-title">{event.eventName}</h2>
            </div>
            <div className="feature-section-row">
              <span className="row-label">DESCRIPTION</span>
              <p className="feature-description">{event.description}</p>
            </div>
            {event.slogan && (
              <div className="feature-section-row slogan-row">
                <p className="feature-slogan">{event.slogan}</p>
              </div>
            )}
            <div className="feature-card-footer">
              <span className="footer-tag">EZEVENT</span>
              <span className="footer-tag">FEATURE</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="ticket-header">
            <img src={event.Image || testImage} alt={event.eventName} />
            {!isVintage && (
              <>
                <div className="ticket-hole top-hole"></div>
                <div className="ticket-hole bottom-hole"></div>
              </>
            )}
            {isVintage && <div className="serial-number">№ 2315742</div>}
          </div>

          <div className="ticket-body">
            {isVintage ? (
              <>
                <div className="vintage-main-content">
                  <span className="vintage-label-sm">{event.subtextTop || "PLATFORM FOR"}</span>
                  <h2 className="ticket-main-title">{event.eventName}</h2>
                  <span className="vintage-label-sm">{event.subtextBottom || "FUTURE EVENT TICKETING"}</span>
                </div>
                <div className="vintage-stub">
                  <div className="vintage-barcode"></div>
                  <div className="admit-one-text">{event.stubText || "EZEVENT"}</div>
                </div>
              </>
            ) : (
              <>
                <div className="ticket-date-row">
                  <span className="ticket-full-date">
                    {day}/{month}/{year.toString().slice(-2)}
                  </span>
                </div>

                <div className="ticket-title-section">
                  <span className="ticket-subtitle">
                    {event.universityId || "UNIVERSITY EVENT"}
                  </span>
                  <h2 className="ticket-main-title">
                    {event.eventName}
                  </h2>
                </div>

                <div className="ticket-divider"></div>

                <div className="ticket-footer">
                  <div className="ticket-info">
                    <span className="ticket-label">EZEVENT</span>
                    <p className="ticket-price">
                      {event.price != "FREE" ? `RM ${event.price}` : "FREE ENTRY"}
                    </p>
                  </div>
                  <button className="ticket-button" onClick={handleButtonClick}>Event Details</button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
