import React, { useState, useEffect } from 'react';
import '../../css/EventDashboard.css';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { useNavigate, NavLink, useLocation } from "react-router-dom";

export default function EventDashboard({ }) {
    const { id } = useParams(); // Matches route parameter :id
    const navigate = useNavigate();

    // --- State Management ---
    const [eventName, setEventName] = useState("Loading...");
    const [qrDocs, setQrDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({
        totalAttendees: 150,
        totalAbsence: 25,
        attendancePercentage: "0.00%",
    });

    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('dashboard'); // Used for button toggle

    // --- Data Calculation (Using current state values) ---
    const totalParticipants = attendanceStats.totalAttendees + attendanceStats.totalAbsence;
    const currentAttendanceRate = totalParticipants > 0
        ? ((attendanceStats.totalAttendees / totalParticipants) * 100).toFixed(2) + "%"
        : "0.00%";

    // --- Authentication and Data Loading ---
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser && id) {
                // Load both event details and QR data
                fetchEventDetails(id);
                loadEventData(currentUser.uid, id);
            } else {
                setQrDocs([]);
            }
        });
        return () => unsub();
    }, [id]);

    async function fetchEventDetails(eventId) {

        const eventDocRef = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDocRef);
        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            setEventName(eventData.eventName);
        } else {
            setEventName("Event Not Found");
        }
    }

    async function loadEventData(uid, currentEventId) {
        setLoading(true);

        try {
            // Load QR codes for the event
            const q = query(
                collection(db, 'QR'),
                where('userId', '==', uid),        // Matches index
                where('eventId', '==', currentEventId), // Matches index
                orderBy('createdAt', 'desc')       // Matches index
            );
            const snaps = await getDocs(q);
            const items = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
            setQrDocs(items);

        } catch (error) {
            console.error("Error loading event data:", error);
        } finally {
            setLoading(false);
        }
    }

    // --- JSX RENDER ---
    return (
        <div className="dashboard-container">
            {/* Event Name Header */}
            <header className="event-header">{eventName}</header>

            {/* --- Main Dashboard View --- */}
            {viewMode === 'dashboard' && (
                <>
                    {/* Main Attendance Card */}
                    <div className="attendance-card-pink">
                        <span className="attendance-rate">{currentAttendanceRate}</span>
                        <span className="attendance-label">Today's Attendance</span>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="stats-row">
                        <div className="stats-card">
                            <span className="stats-number">{attendanceStats.totalAttendees}</span>
                            <span className="stats-label">Total Attendees</span>
                        </div>
                        <div className="stats-card">
                            <span className="stats-number">{attendanceStats.totalAbsence}</span>
                            <span className="stats-label">Total Absence</span>
                        </div>
                    </div>
                </>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
                <button className="action-button-brown" onClick={() => navigate(`/organizer/my-event/${id}/attendance-list`, { state: { eventName } })}>
                    Attendance List
                </button>
                <button className="action-button-brown" onClick={() => console.log('Generate Report')}>
                    Generate Report
                </button>
                <button className="action-button-brown" onClick={() => setViewMode(viewMode === 'dashboard' ? 'qr' : 'dashboard')}>
                    {viewMode === 'dashboard' ? 'View QR' : 'Back to Dashboard'}
                </button>
            </div>

            {viewMode === 'qr' && (
                <div className="viewqr-container">
                    <h2>Your Event QR Codes</h2>
                    <hr />
                    {loading && <div className="loading-message">Loading QR codes...</div>}
                    {!loading && qrDocs.length === 0 && <div className="no-qrs">No QR codes found for this event.</div>}

                    <div className="qr-grid">
                        {qrDocs.map((doc) => (
                            <div className="qr-item" key={doc.id}>
                                {doc.imageQR ? (
                                    <img src={doc.imageQR} alt={`QR ${doc.id}`} />
                                ) : (
                                    <div className="qr-placeholder">No image</div>
                                )}
                                <div className="qr-meta">ID: {doc.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}