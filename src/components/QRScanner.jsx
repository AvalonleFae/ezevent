import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  doc,
  getDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import '../css/QRScanner.css';

const AttendanceScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const db = getFirestore();
  const auth = getAuth();
  const navigate = useNavigate();

  const handleScan = async (result) => {
    if (result && result.length > 0 && status === 'idle') {
      const scannedQrId = result[0].rawValue;
      setScanResult(scannedQrId);
      processAttendance(scannedQrId);
    }
  };

  const handleError = (error) => {
    console.error("Scanner Error:", error);
    if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
      setStatus('permission-denied');
      setMessage("Camera permission was denied. Please update your browser settings.");
    }
  };

  const processAttendance = async (qrId) => {
    setStatus('processing');
    setMessage('VERIFYING AUTHORIZATION...');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("UNAUTHORIZED. PLEASE LOG IN.");

      // STEP 1: Look up QR Code to get Event ID
      const qrDocRef = doc(db, 'QR', qrId);
      const qrSnapshot = await getDoc(qrDocRef);

      if (!qrSnapshot.exists()) throw new Error("INVALID ACCESS TOKEN.");

      const qrData = qrSnapshot.data();
      const eventId = qrData.eventId;

      if (!eventId) throw new Error("TOKEN CORRUPTED.");

      // STEP 2: Fetch Event Details
      const eventDocRef = doc(db, 'events', eventId);
      const eventSnapshot = await getDoc(eventDocRef);

      let eventName = eventId;
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        eventName = eventData.eventName || eventId;

        // Restriction Check: Participants cannot scan attendance past the event date
        const eventEndDate = eventData.endDate ? eventData.endDate.toDate() : (eventData.date ? eventData.date.toDate() : null);
        if (eventEndDate) {
          const now = new Date();
          const cutoff = new Date(eventEndDate);
          // Set cutoff to the very end of the event day (23:59:59)
          // so participants can scan any time on the specified end date.
          cutoff.setHours(23, 59, 59, 999);

          if (now > cutoff) {
            throw new Error("ATTENDANCE WINDOW CLOSED. THE EVENT HAS ENDED.");
          }
        }
      }

      setMessage(`SYNCING WITH: ${eventName.toUpperCase()}...`);

      // STEP 3: Find Registration
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );

      const registrationSnapshot = await getDocs(q);

      if (registrationSnapshot.empty) throw new Error("REGISTRATION DATA NOT FOUND.");

      const registrationDoc = registrationSnapshot.docs[0];

      // STEP 4: Find Attendance Sub-collection
      const attendanceRef = collection(db, `registrations/${registrationDoc.id}/attendance`);
      const attendanceSnapshot = await getDocs(attendanceRef);

      if (attendanceSnapshot.empty) throw new Error("ATTENDANCE PROTOCOL MISSING.");

      const attendanceDoc = attendanceSnapshot.docs[0];

      // STEP 5: Check Previous Check-in
      if (attendanceDoc.data().status === 'present') {
        setStatus('success');
        setMessage(`ACCESS ALREADY LOGGED: ${eventName.toUpperCase()}`);
        setIsCameraOpen(false);
        return;
      }

      // STEP 6: Update Status
      await updateDoc(attendanceDoc.ref, {
        status: "present",
        checkInTime: serverTimestamp()
      });

      setStatus('success');
      setMessage(`ACCESS GRANTED: ${eventName.toUpperCase()}`);
      setIsCameraOpen(false);

    } catch (error) {
      console.error("Attendance Error:", error);
      setStatus('error');
      setMessage(error.message.toUpperCase());
      setIsCameraOpen(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus('idle');
    setMessage('');
    setIsCameraOpen(true);
  };

  const navigateHistory = () => {
    navigate('/participant/history');
  };

  return (
    <div className="scanner-container">
      <div className="halftone-bg"></div>
      <div className="scanner-card">
        <button onClick={() => navigate('/participant')} className="tbhx-button secondary back-button">
          &larr; BACK
        </button>
        <h2 className="tbhx-header">QR <span className="text-glow">SCANNER</span></h2>

        {/* ERROR: Permission Denied State */}
        {status === 'permission-denied' && (
          <div className="status-box error">
            <div className="status-icon">📷</div>
            <strong>CAMERA OFFLINE</strong>
            <p className="status-desc">
              PLEASE ENABLE CAMERA ACCESS.
            </p>
            <button onClick={() => window.location.reload()} className="tbhx-button">
              REBOOT SCANNER
            </button>
          </div>
        )}

        {/* 1. START STATE: Button to open Scanner */}
        {!isCameraOpen && status === 'idle' && (
          <div className="start-scan-container">
            <div className="start-icon">📷</div>
            <p className="start-text">
              SCAN QR FOR EVENT ATTENDANCE
            </p>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="tbhx-button"
            >
              SCAN NOW
            </button>
          </div>
        )}

        {/* 2. SCANNING STATE: Actual Camera UI */}
        {isCameraOpen && (status === 'idle' || status === 'processing') && (
          <div className="scanner-window">
            <Scanner
              onScan={handleScan}
              onError={handleError}
              constraints={{ facingMode: 'environment' }}
              components={{
                audio: false,
                finder: true,
              }}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
          </div>
        )}

        {/* 3. RESULT STATES: Processing, Success, or Error */}
        <div className="status-area">

          {status === 'processing' && (
            <div className="status-box processing">
              <strong>PROCESSING...</strong>
              <p className="status-subtext">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-box success">
              <strong>ATTENDANCE REGISTRATION SUCCESS</strong>
              <p>{message}</p>
              <button onClick={navigateHistory} className="tbhx-button">
                HISTORY LOG
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="status-box error">
              <strong>ATTENDANCE REGISTRATION FAILED</strong>
              <p className="error-detail">{message}</p>
              <button onClick={resetScanner} className="tbhx-button">
                RETRY SCAN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;