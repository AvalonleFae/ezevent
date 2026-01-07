import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import '../../css/SuccessPage.css';

const SuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Get eventId from the URL (passed from Stripe)
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    const fetchEventMessage = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // Get the specific message field
          setMessage(docSnap.data().afterRegistrationMessage);
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventMessage();
  }, [eventId]);

  const handleDone = () => {
    navigate('/participant/history');
  };

  if (loading) return (
    <div className="success-loading">
      <div className="halftone-bg"></div>
      <div className="loading-glitch">SYNCING REGISTRATION...</div>
    </div>
  );

  return (
    <div className="success-page-container">
      <div className="halftone-bg"></div>
      <div className="success-message-box">
        <h2 className="success-text">SUCCESS</h2>
        <p>YOU HAVE SUCCESSFULLY REGISTERED FOR THE EVENT.</p>

        {/* Display the After Registration Message */}
        {message && (
          <div className="message-intel">
            <span className="intel-label">MESSAGE FROM THE ORGANIZER:</span>
            <p className="intel-content">{message}</p>
          </div>
        )}

        <button className='tbhx-button success-done-btn' onClick={handleDone}>
          VIEW MY EVENTS
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;