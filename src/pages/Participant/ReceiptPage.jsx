import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useAuth } from "../../components/AuthContext";
import "../../css/ReceiptPage.css";

export default function ReceiptPage() {
  const { id } = useParams(); // Event ID
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [regInfo, setRegInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceiptData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Event Details
        const eventSnap = await getDoc(doc(db, "events", id));

        // 2. Fetch specific Registration details for this user and event
        const regQuery = query(
          collection(db, "registrations"),
          where("eventId", "==", id),
          where("userId", "==", user?.uid)
        );
        const regSnapshot = await getDocs(regQuery);

        if (eventSnap.exists() && !regSnapshot.empty) {
          setData(eventSnap.id ? { id: eventSnap.id, ...eventSnap.data() } : null);
          setRegInfo(regSnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching receipt:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchReceiptData();
  }, [id, user]);

  if (loading) return (
    <div className="receipt-loading">
      <div className="halftone-bg"></div>
      <div className="loading-glitch">LOADING RECEIPT...</div>
    </div>
  );

  if (!data || !regInfo) return (
    <div className="receipt-error">
      <div className="halftone-bg"></div>
      <div className="error-glitch">RECEIPT DATA CORRUPTED.</div>
      <button onClick={() => navigate(-1)} className="tbhx-button">BACK</button>
    </div>
  );

  return (
    <div className="receipt-container">
      <div className="halftone-bg"></div>

      <div className="receipt-actions">
        <button className="tbhx-button secondary" onClick={() => navigate(-1)}>&larr; BACK</button>
        <button className="tbhx-button" onClick={() => window.print()}>PRINT AUTHORIZATION</button>
      </div>

      <div className="receipt-card">
        <div className="receipt-header">
          <div className="brand">
            <h2>EZ-EVENT</h2>
            <p>OFFICIAL AUTHORIZATION RECEIPT</p>
          </div>
          <div className="status-badge-container">
            <span className="status-badge">{regInfo.status?.toUpperCase()}</span>
          </div>
        </div>

        <div className="receipt-section">
          <label>MISSION INTEL</label>
          <h3 className="event-title text-glow">{data.eventName.toUpperCase()}</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span>DATE</span>
              <p>{new Date(data.date?.seconds * 1000).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <span>LOCATION</span>
              <p>{data.address?.toUpperCase() || "CAMPUS SECTOR"}</p>
            </div>
          </div>
        </div>

        <div className="receipt-divider"></div>

        <div className="receipt-section">
          <label>TRANSACTION PROTOCOL</label>
          <div className="payment-table">
            <div className="payment-row">
              <span>CRYPTO ID</span>
              <p className="mono">{regInfo.paymentId}</p>
            </div>
            <div className="payment-row">
              <span>REGISTRATION TIMESTAMP</span>
              <p>{new Date(regInfo.registeredAt?.seconds * 1000).toLocaleString()}</p>
            </div>
            <div className="payment-row">
              <span>GATEWAY</span>
              <p>STRIPE SECURE LAYER</p>
            </div>
            <div className="payment-row total">
              <span>TOTAL CREDITS</span>
              <p>{regInfo.currency} {regInfo.amountPaid}</p>
            </div>
          </div>
        </div>

        <div className="receipt-footer">
          <p>AUTHORIZATION CONFIRMED</p>
          <small>DIGITALLY SIGNED. NO PHYSICAL SIGNATURE REQUIRED.</small>
        </div>
      </div>
    </div>
  );
}