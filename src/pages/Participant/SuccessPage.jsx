// src/pages/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust path to your firebase config file
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

  if (loading) return <div>Loading registration details...</div>;

  return (
    <div className="success-page-container">
      <div className="success-message-box">
        <h2 className="success-text">Payment Successful!</h2>
        <p>You have been officially registered.</p>

        {/* Display the After Registration Message */}
        {message && (
          <div>
            <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
          </div>
        )}

        <button className='back-button' onClick={handleDone}>
          Go to My Events
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;