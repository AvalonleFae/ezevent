import React, { useState, useEffect } from 'react';
import '../../css/EventDashboard.css';
import '../../css/Report.css';
import { collection, query, where, getDocs, orderBy, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";

export default function EventDashboard({ }) {
    const { id } = useParams(); // Matches route parameter :id
    const navigate = useNavigate();

    // --- State Management ---
    const [eventName, setEventName] = useState("Loading...");
    const [eventStatus, setEventStatus] = useState("Loading");
    const [qrDocs, setQrDocs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({
        totalAttendees: 0,
        totalAbsence: 0,
        attendancePercentage: "0.00%",
    });

    const [user, setUser] = useState(null);
    const [viewMode, setViewMode] = useState('dashboard'); // Used for button toggle
    const [eventDate, setEventDate] = useState(null);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [openingReview, setOpeningReview] = useState(false);
    const [registrationOpen, setRegistrationOpen] = useState(false);
    const [updatingRegistration, setUpdatingRegistration] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    // --- Data Calculation (Using current state values) ---
    // Note: This derived state is for display only; the actual calc happens in fetchAttendanceStats
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
                fetchAttendanceStats(id);
            } else {
                setQrDocs([]);
            }
        });
        return () => unsub();
    }, [id]);

    async function fetchAttendanceStats(currentEventId) {
        try {
            // 1. Get all registrations for this event
            const regQuery = query(collection(db, 'registrations'), where('eventId', '==', currentEventId));
            const regSnap = await getDocs(regQuery);

            // 2. Check attendance subcollection for each registration in parallel
            const statsPromises = regSnap.docs.map(async (regDoc) => {
                const attendanceSub = collection(db, 'registrations', regDoc.id, 'attendance');
                const attendanceSnap = await getDocs(attendanceSub);

                // Check if ANY document in the subcollection has status 'present'
                // We do NOT check eventId here because the subcollection doc 
                // doesn't have it (and the parent is already filtered by eventId).
                const isPresent = attendanceSnap.docs.some(doc => doc.data().status === 'present');

                return isPresent ? 'present' : 'absent';
            });

            // 3. Resolve all checks
            const results = await Promise.all(statsPromises);

            // 4. Calculate totals
            const presentCount = results.filter(status => status === 'present').length;
            const absentCount = results.filter(status => status === 'absent').length;

            const total = presentCount + absentCount;
            const percentage = total > 0
                ? ((presentCount / total) * 100).toFixed(2) + "%"
                : "0.00%";

            setAttendanceStats({
                totalAttendees: presentCount,
                totalAbsence: absentCount,
                attendancePercentage: percentage,
            });

        } catch (error) {
            console.error("Error fetching attendance stats:", error);
        }
    }

    async function fetchEventDetails(eventId) {

        const eventDocRef = doc(db, 'events', eventId);
        const eventSnapshot = await getDoc(eventDocRef);
        if (eventSnapshot.exists()) {
            const eventData = eventSnapshot.data();
            setEventName(eventData.eventName);
            const end = eventData.endDate?.toDate ? eventData.endDate.toDate() : (eventData.date?.toDate ? eventData.date.toDate() : new Date(eventData.date));
            setEventDate(end);
            setReviewOpen(eventData.reviewOpen || false);
            setEventStatus(eventData.status || 'pending');
            setRegistrationOpen(eventData.registrationOpen || false);
            if (eventData.reviewOpen) {
                fetchReviews(eventId);
            }
        } else {
            setEventName("Event Not Found");
            setEventStatus("NotFound");
        }
    }

    async function loadEventData(uid, currentEventId) {
        setLoading(true);

        try {
            // Load QR codes for the event
            const q = query(
                collection(db, 'QR'),
                where('userId', '==', uid),
                where('eventId', '==', currentEventId),
                orderBy('createdAt', 'desc')
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

    async function fetchReviews(eventId) {
        try {
            const reviewSnap = await getDocs(collection(db, 'events', eventId, 'review'));
            const reviewList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(reviewList);

            if (reviewList.length > 0) {
                const totalRating = reviewList.reduce((acc, rev) => acc + (rev.rating || 0), 0);
                setAvgRating((totalRating / reviewList.length).toFixed(1));
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    }

    const handleToggleReview = async () => {
        if (!id) return;
        setOpeningReview(true);
        const newStatus = !reviewOpen;
        try {
            await updateDoc(doc(db, 'events', id), {
                reviewOpen: newStatus
            });
            setReviewOpen(newStatus);
            alert(newStatus ? "Review has been opened to all participants!" : "Review has been closed.");
        } catch (error) {
            console.error("Error toggling review:", error);
            alert("Failed to update review status. Please try again.");
        } finally {
            setOpeningReview(false);
        }
    };

    // Toggle Event Registration
    const handleToggleRegistration = async () => {
        if (!id) return;
        setUpdatingRegistration(true);
        const newStatus = !registrationOpen;
        try {
            await updateDoc(doc(db, 'events', id), {
                registrationOpen: newStatus
            });
            setRegistrationOpen(newStatus);
            alert(newStatus ? "Registration is now OPEN for participants!" : "Registration is now CLOSED.");
        } catch (error) {
            console.error("Error toggling registration:", error);
            alert("Failed to update registration status.");
        } finally {
            setUpdatingRegistration(false);
        }
    };

    // Download QR code as image
    const downloadQRCode = async (imageUrl, qrId) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QRCode_${qrId.substring(0, 8)}_${eventName.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading QR code:", error);
            alert("Failed to download QR code. Please try again.");
        }
    };

    // Print QR code
    const printQRCode = (imageUrl, qrId) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert("Please allow pop-ups to print QR code");
            return;
        }

        printWindow.document.write(`
            <html>
                <head>
                    <title>QR Code - ${qrId.substring(0, 8)}</title>
                    <style>
                        body { 
                            margin: 0; 
                            padding: 0; 
                            display: flex; 
                            flex-direction: column; 
                            align-items: center; 
                            justify-content: center;
                            min-height: 100vh;
                            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            background: white;
                        }
                        .qr-container {
                            text-align: center;
                            width: 90%;
                            max-width: 800px;
                            padding: 40px;
                        }
                        img { 
                            width: 100%; 
                            max-width: 650px;
                            height: auto; 
                            display: block; 
                            margin: 0 auto;
                            image-rendering: -webkit-optimize-contrast;
                            image-rendering: crisp-edges;
                        }
                        .qr-info { 
                            margin-top: 50px; 
                        }
                        .event-name { 
                            font-size: 48px; 
                            font-weight: 900; 
                            margin-bottom: 20px;
                            color: #000;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            line-height: 1.2;
                        }
                        .qr-id { 
                            font-size: 28px; 
                            color: #333;
                            font-weight: 600;
                            letter-spacing: 3px;
                        }
                        @media print {
                            body { padding: 0; margin: 0; }
                            .qr-container { width: 100%; max-width: none; padding: 0; }
                            img { width: 90%; max-width: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="qr-container">
                        <img src="${imageUrl}" alt="QR Code" />
                        <div class="qr-info">
                            <div class="event-name">${eventName}</div>
                            <div class="qr-id">QR ID: ${qrId.substring(0, 8)}</div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() {
                            // Small delay ensures images are fully rendered in all browsers
                            setTimeout(() => {
                                window.print();
                                window.onafterprint = function() {
                                    window.close();
                                };
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // --- JSX RENDER ---
    // If event is not accepted, show access-restricted message
    if (eventStatus !== "Loading" && eventStatus !== "Accepted") {
        return (
            <div className="dashboard-container-tbhx">
                <div className="halftone-bg"></div>

                <header className="event-header-tbhx">
                    <h1 className="tbhx-header">Event <span className="text-glow-org">Dashboard</span></h1>
                    <p className="current-event-name">{eventName}</p>
                    <div className="header-accent"></div>
                </header>

                <div style={{
                    textAlign: 'center',
                    padding: '3rem 1.5rem',
                    maxWidth: '640px',
                    margin: '2rem auto',
                    background: 'rgba(15, 23, 42, 0.85)',
                    borderRadius: '12px',
                    border: '1px solid rgba(248, 113, 113, 0.5)',
                    color: 'white'
                }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--primary-red)' }}>
                        {eventStatus === 'pending' || eventStatus === 'Pending'
                            ? 'Event Approval Pending'
                            : eventStatus === 'Declined'
                                ? 'Event Has Been Declined'
                                : 'Event Not Available'}
                    </h2>
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                        You can only access the event dashboard once the admin has approved this event.
                        Please check back after the event status is updated to <strong>Accepted</strong>.
                    </p>
                    <button
                        className="tbhx-button"
                        style={{ marginTop: '2rem' }}
                        onClick={() => navigate('/organizer/my-events')}
                    >
                        BACK TO MY EVENTS
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container-tbhx">
            <div className="halftone-bg"></div>

            {/* Event Name Header */}
            <header className="event-header-tbhx">
                <h1 className="tbhx-header">Event <span className="text-glow-org">Dashboard</span></h1>
                <p className="current-event-name">{eventName}</p>
                <div className="header-accent"></div>
            </header>

            {/* --- Main Dashboard View --- */}
            {viewMode === 'dashboard' && (
                <div className="dashboard-main-content">
                    {/* Main Attendance Card */}
                    <div className="attendance-hero-card">
                        <span className="attendance-rate">{currentAttendanceRate}</span>
                        <span className="attendance-label">CURRENT ATTENDANCE</span>
                    </div>

                    {/* Stats Cards Row */}
                    <div className="stats-grid">
                        <div className="tbhx-card stats-card-tbhx">
                            <span className="stats-label">PRESENT</span>
                            <span className="stats-number text-glow-cyan">{attendanceStats.totalAttendees}</span>
                        </div>
                        <div className="tbhx-card stats-card-tbhx">
                            <span className="stats-label">ABSENT</span>
                            <span className="stats-number text-glow-red">{attendanceStats.totalAbsence}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="action-row-tbhx">
                <button className="tbhx-button" onClick={() => navigate(`/organizer/my-event/${id}/attendance-list`, { state: { eventName } })}>
                    ATTENDANCE LIST
                </button>
                <button className="tbhx-button" onClick={() => navigate(`/organizer/my-event/${id}/report`, { state: { eventName } })}>
                    GENERATE REPORT
                </button>
                <button
                    className={`tbhx-button ${registrationOpen ? 'danger-btn' : 'success-btn'}`}
                    onClick={handleToggleRegistration}
                    disabled={updatingRegistration}
                >
                    {updatingRegistration ? 'UPDATING...' : (registrationOpen ? 'CLOSE REGISTRATION' : 'OPEN REGISTRATION')}
                </button>
                {eventDate && new Date() > eventDate && (
                    <>
                        <button
                            className={`tbhx-button ${reviewOpen ? 'secondary' : 'review-open-btn'}`}
                            onClick={reviewOpen ? () => setViewMode(viewMode === 'reviews' ? 'dashboard' : 'reviews') : handleToggleReview}
                            disabled={!reviewOpen && openingReview}
                        >
                            {openingReview && !reviewOpen ? 'OPENING...' : reviewOpen ? (viewMode === 'reviews' ? 'BACK TO DASHBOARD' : 'VIEW REVIEWS') : 'OPEN REVIEW'}
                        </button>
                        {reviewOpen && (
                            <button
                                className="tbhx-button danger-btn"
                                onClick={handleToggleReview}
                                disabled={openingReview}
                            >
                                {openingReview ? 'CLOSING...' : 'CLOSE REVIEW'}
                            </button>
                        )}
                    </>
                )}
                <button className="tbhx-button secondary" onClick={() => setViewMode(viewMode === 'dashboard' ? 'qr' : 'dashboard')}>
                    {viewMode === 'dashboard' ? 'VIEW QR CODES' : 'BACK TO DASHBOARD'}
                </button>
            </div>

            {viewMode === 'qr' && (
                <div className="viewqr-container-tbhx">
                    <h2 className="tbhx-header">Event <span className="text-glow-org">QR Access</span></h2>

                    {loading && <div className="loading-message">INCOMING DATA...</div>}
                    {!loading && qrDocs.length === 0 && <div className="no-qrs">NO QR CODES GENERATED FOR THIS SECTOR.</div>}

                    <div className="qr-grid-tbhx">
                        {qrDocs.map((doc) => (
                            <div className="tbhx-card qr-item-tbhx" key={doc.id}>
                                {doc.imageQR ? (
                                    <img src={doc.imageQR} alt={`QR ${doc.id}`} />
                                ) : (
                                    <div className="qr-placeholder">NO DATA</div>
                                )}
                                <div className="qr-meta">ID: {doc.id.substring(0, 8)}...</div>
                                {doc.imageQR && (
                                    <div className="qr-actions">
                                        <button
                                            className="qr-action-btn print-btn"
                                            onClick={() => printQRCode(doc.imageQR, doc.id)}
                                            title="Print QR Code"
                                        >
                                            🖨 Print
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'reviews' && (
                <div className="reviews-view-tbhx">
                    <div className="reviews-header-tbhx">
                        <h2 className="tbhx-header">Participant <span className="text-glow-org">Feedback</span></h2>
                        <div className="avg-rating-badge">
                            <span className="rating-val">{avgRating}</span>
                            <span className="rating-star">★</span>
                            <span className="rating-count">({reviews.length} reviews)</span>
                        </div>
                    </div>

                    <div className="reviews-list-tbhx">
                        {reviews.length > 0 ? (
                            reviews.map((rev) => (
                                <div key={rev.id} className="review-item-tbhx">
                                    <div className="review-item-header">
                                        <span className="reviewer-name">{rev.userName || "Anonymous"}</span>
                                        <div className="reviewer-rating">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`mini-star ${i < rev.rating ? 'filled' : ''}`}>★</span>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="review-message">"{rev.message}"</p>
                                    <div className="review-meta">
                                        <span>Recommend: {rev.recommend}</span> | <span>Objective Achieved: {rev.objective}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-reviews">No reviews submitted yet for this event.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}