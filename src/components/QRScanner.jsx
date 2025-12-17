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
    } else {
      console.log(error?.message);
    }
  };

 const processAttendance = async (qrId) => {
    setStatus('processing');
    setMessage('Verifying QR code...');

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("You must be logged in to scan.");

      // STEP 1: Look up QR Code to get Event ID
      const qrDocRef = doc(db, 'QR', qrId);
      const qrSnapshot = await getDoc(qrDocRef);

      if (!qrSnapshot.exists()) throw new Error("Invalid QR Code.");

      const qrData = qrSnapshot.data();
      const eventId = qrData.eventId;

      if (!eventId) throw new Error("QR Code is not linked to any event.");

      // STEP 2: Fetch Event Details
      const eventDocRef = doc(db, 'events', eventId); 
      const eventSnapshot = await getDoc(eventDocRef);
      
      let eventName = eventId;
      if (eventSnapshot.exists()) {
        const eventData = eventSnapshot.data();
        eventName = eventData.title || eventData.name || eventData.eventName || eventId;
      }

      setMessage(`Checking registration for: ${eventName}...`);

      // STEP 3: Find Registration
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef,
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );

      const registrationSnapshot = await getDocs(q);

      if (registrationSnapshot.empty) throw new Error("You are not registered for this event.");

      const registrationDoc = registrationSnapshot.docs[0];

      // STEP 4: Find Attendance Sub-collection
      const attendanceRef = collection(db, `registrations/${registrationDoc.id}/attendance`);
      const attendanceSnapshot = await getDocs(attendanceRef);

      if (attendanceSnapshot.empty) throw new Error("Attendance record missing.");

      const attendanceDoc = attendanceSnapshot.docs[0];

      // STEP 5: Check Previous Check-in
      if (attendanceDoc.data().status === 'present') {
        setStatus('success');
        setMessage(`Already checked in: ${eventName}`);
        setIsCameraOpen(false);
        return;
      }

      // STEP 6: Update Status
      await updateDoc(attendanceDoc.ref, {
        status: "present",
        checkInTime: serverTimestamp()
      });

      setStatus('success');
      setMessage(`Success! Checked in for: ${eventName}`);
      setIsCameraOpen(false);

    } catch (error) {
      console.error("Attendance Error:", error);
      setStatus('error');
      setMessage(error.message);
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
      <div className="scanner-card">
        <button onClick={() => navigate(-1)} className="back-button">
          ⬅ Back
        </button>
        <h2 className="scanner-title">Scan Event QR</h2>

        {/* ERROR: Permission Denied State */}
        {status === 'permission-denied' && (
          <div className="status-box permission">
            <div className="status-icon">📷</div>
            <p><strong>Camera Access Needed</strong></p>
            <p className="status-desc">
              Please allow camera access in your browser URL bar.
            </p>
            <button onClick={() => window.location.reload()} className="action-btn btn-reload">
              Reload Page
            </button>
          </div>
        )}

        {/* 1. START STATE: Button to open Scanner */}
        {!isCameraOpen && status === 'idle' && (
          <div className="start-scan-container">
            <div className="start-icon">📷</div>
            <p className="start-text">
              Ready to check in? Click below to activate your camera.
            </p>
            <button
              onClick={() => setIsCameraOpen(true)}
              className="action-btn btn-primary"
            >
              Open Scanner
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
              // This prop is specific to the library and often requires inline objects
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
            <p className="scanner-overlay-text">
              Align QR code within frame
            </p>
          </div>
        )}

        {/* 3. RESULT STATES: Processing, Success, or Error */}
        <div className="status-area">

          {status === 'processing' && (
            <div className="status-box processing">
              <p><strong>Processing...</strong></p>
              <p className="status-subtext">{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="status-box success">
              <p><strong>Check-in Verified!</strong></p>
              <p>{message}</p>
              <button onClick={navigateHistory} className="action-btn btn-success">
                Go to Event History
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="status-box error">
              <p><strong>Check-in Failed</strong></p>
              <p className="error-detail">{message}</p>
              <button onClick={resetScanner} className="action-btn btn-error">
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceScanner;