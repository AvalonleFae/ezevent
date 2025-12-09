import React, { useState } from 'react';
import QrReader from 'html5-qrcode';
import { useAuth } from './AuthContext';

function AttendanceScanner() {
  const {user} = useAuth(); //Get the current user object
  const [feedback, setFeedback] = useState('ready to scan');

  // Called when the scanner successfully reads a code
  const handleScan = async (decodedEventId) => {
    if (decodedEventId && user && user.uid) { // <--- CHECK for both Event ID and User ID
      setFeedback(`Checking in user ${user.uid} for Event: ${decodedEventId}...`);

      // 1. Check if user is already checked in AND 
      // 2. Atomically increment the total count
      const success = await checkInParticipant(decodedEventId, user.uid);

      if (success) {
        setFeedback(`Success! User ${user.uid} checked in for Event: ${decodedEventId}`);
      } else {
      setFeedback('Error: Scan failed or you are not logged in.');
    }
  };
}

  // Called if there is an error (e.g., camera access denied)
  const handleError = (err) => {
    console.error(err);
    setScanResult('Error: Could not access camera or handle scan.');
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h3>QR Code Scanner</h3>
      <div style={{ border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <QrReader
          delay={300} // Delay between scan attempts (in ms)
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
          // facingMode can be 'user' (front camera) or 'environment' (back camera)
          facingMode="environment"   
        />
      </div>
      
      <p style={{ marginTop: '20px' }}>
        **Decoded Result:** <br />
        <span style={{ fontWeight: 'bold', color: scanResult.startsWith('Error') ? 'red' : 'green' }}>
          {scanResult}
        </span>
      </p>
    </div>
  );
}

export default QRCodeScanner;