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

const AttendanceScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error, permission-denied
  const [message, setMessage] = useState('');

  const db = getFirestore();
  const auth = getAuth();

  const handleScan = async (result) => {
    if (result && result.length > 0 && status === 'idle') {
      const scannedQrId = result[0].rawValue;
      setScanResult(scannedQrId);
      processAttendance(scannedQrId);
    }
  };

  const handleError = (error) => {
    console.error("Scanner Error:", error);
    // Check for specific permission errors
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

      // --- STEP 1: Look up Event ---
      const qrDocRef = doc(db, 'QR', qrId);
      const qrSnapshot = await getDoc(qrDocRef);

      if (!qrSnapshot.exists()) throw new Error("Invalid QR Code.");
      
      const qrData = qrSnapshot.data();
      const eventId = qrData.eventId;

      if (!eventId) throw new Error("QR Code is not linked to any event.");
      
      setMessage('Finding your registration...');

      // --- STEP 2: Find Registration ---
      const registrationsRef = collection(db, 'registrations');
      const q = query(
        registrationsRef, 
        where("eventId", "==", eventId),
        where("userId", "==", currentUser.uid)
      );

      const registrationSnapshot = await getDocs(q);

      if (registrationSnapshot.empty) throw new Error("You are not registered for this event.");

      const registrationDoc = registrationSnapshot.docs[0];
      
      // --- STEP 3: Find Attendance Sub-collection ---
      const attendanceRef = collection(db, `registrations/${registrationDoc.id}/attendance`);
      const attendanceSnapshot = await getDocs(attendanceRef);

      if (attendanceSnapshot.empty) throw new Error("Attendance record missing.");

      const attendanceDoc = attendanceSnapshot.docs[0];

      // --- STEP 4: Check Previous Check-in ---
      if (attendanceDoc.data().status === 'present') {
        setStatus('success');
        setMessage(`Already checked in: ${qrData.eventId}`);
        return;
      }

      // --- STEP 5: Update Status ---
      await updateDoc(attendanceDoc.ref, {
        status: "present",
        checkInTime: serverTimestamp()
      });

      setStatus('success');
      setMessage(`Success! Checked in for Event ID: ${eventId}`);

    } catch (error) {
      console.error("Attendance Error:", error);
      setStatus('error');
      setMessage(error.message);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setStatus('idle');
    setMessage('');
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Scan Event QR</h2>

      {/* ERROR: Permission Denied State */}
      {status === 'permission-denied' && (
        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200 text-center w-full">
           <div className="text-4xl mb-2">📷</div>
           <p className="font-bold">Camera Access Needed</p>
           <p className="text-sm mt-2">
             We cannot access your camera. Please click the lock icon 🔒 in your address bar and allow camera access.
           </p>
           <button 
             onClick={() => window.location.reload()}
             className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
           >
             Reload Page
           </button>
        </div>
      )}

      {/* QR Scanner */}
      {(status === 'idle' || status === 'processing') && (
        <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300 relative">
           <Scanner 
              onScan={handleScan} 
              onError={handleError}
              // Force usage of rear camera (environment)
              constraints={{ 
                facingMode: 'environment' 
              }}
              components={{
                audio: false,
                finder: true,
              }}
          />
          <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm bg-black/50 py-1">
            Align QR code within frame
          </p>
        </div>
      )}

      {/* Status Messages */}
      <div className="mt-6 text-center w-full">
        
        {status === 'processing' && (
          <div className="p-4 bg-blue-50 text-blue-800 rounded-lg animate-pulse border border-blue-200">
            <p className="font-semibold">Processing...</p>
            <p className="text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="p-6 bg-green-50 text-green-800 rounded-lg border border-green-200 shadow-sm">
            <div className="text-4xl mb-2"></div>
            <p className="font-bold text-lg">Check-in Verified!</p>
            <p className="text-sm mt-1 mb-4 opacity-80">{message}</p>
            <button 
              onClick={resetScanner}
              className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition-colors"
            >
              Scan Another Event
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="p-6 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-sm">
             <div className="text-4xl mb-2"></div>
            <p className="font-bold text-lg">Check-in Failed</p>
            <p className="text-sm mt-1 mb-4 font-mono bg-red-100 p-2 rounded">{message}</p>
            <button 
              onClick={resetScanner}
              className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceScanner;