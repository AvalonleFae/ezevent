import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { db } from "../../firebase"; 
import '../../css/ValidateEventDetails.css';

export default function ValidateEventDetails() {
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [eventData, setEventData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); 

    const SERVICE_ID = "service_ezevent"; 
    const TEMPLATE_ID = "template_3lwo8n3"; 
    const PUBLIC_KEY = "tbsCwOVG73gOBa1XX"; 

    const formatTimestamp = (timestamp) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleString();
        }
        return 'N/A';
    };

    useEffect(() => {
        console.log("Current URL ID:", id); 

        const fetchEventAndUserDetails = async () => {
            try {
                setLoading(true);

                // 1. Fetch Event
                console.log("Fetching event for ID:", id);
                const eventRef = doc(db, 'events', id);
                const eventSnapshot = await getDoc(eventRef);

                if (eventSnapshot.exists()) {
                    const eventDetails = eventSnapshot.data();
                    setEventData({ id: eventSnapshot.id, ...eventDetails });

                    // 2. Fetch User
                    if (eventDetails.userId) {
                        const userRef = doc(db, 'users', eventDetails.userId);
                        const userSnapshot = await getDoc(userRef);

                        if (userSnapshot.exists()) {
                            setUserData({ id: userSnapshot.id, ...userSnapshot.data() });
                        } else {
                            console.warn("User document not found in 'users' collection");
                        }
                    } else {
                        console.warn("Event document has no 'userid' field");
                    }
                } else {
                    console.error("Event document does not exist!");
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEventAndUserDetails();
        } else {
            console.error("No ID detected in URL parameters");
            setLoading(false);
        }
    }, [id]);

    const handleVerify = async (status) => {
        if (!eventData || !userData || !eventData.id || !userData.id) return;

        setIsSubmitting(true);
        let reason = '';

        if (status === 'Declined') {
            reason = prompt(`Please provide a reason for declining the event: ${eventData.eventName}`);
            if (!reason) {
                alert('A reason is required to decline the event.');
                setIsSubmitting(false);
                return;
            }
        } else {
            reason = "The event details have been successfully verified and approved.";
        }

        try {
            // 1. Update Event Status
            const eventRef = doc(db, 'events', eventData.id);
            await updateDoc(eventRef, {
                status: status, 
            });
            setEventData(prev => ({ ...prev, status: status }));
            console.log(`Event status updated to: ${status}`);

            // 2. SEND EMAIL VIA EMAILJS
            const emailParams = {
                event_name: eventData.eventName,
                event_id: eventData.id,
                email: userData.email,
                name: userData.name,
                status: status,
                reason: reason,
                validation_link: window.location.href 
            };

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY)
                .then((response) => {
                    console.log('Event validation email sent successfully!', response.status, response.text);
                })
                .catch((err) => {
                    console.error('Failed to send event validation email. Error:', err);
                });

            setTimeout(() => navigate('/admin/validate-events'), 1500);

        } catch (error) {
            console.error(`Error updating status to ${status}:`, error);
            alert(`Failed to update status: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!eventData) return <div>Event Not Found.</div>;


    return (
        <div className="validate-event-container">
            <h2>Validate Event Details</h2>

            <div className="back-btn-wrapper">
                <button
                    type="button"
                    className="back-btn"
                    onClick={() => navigate('/admin/validate-events')}
                >
                    Back
                </button>
            </div>

            <p className="details-line" style={{ fontWeight: 'bold' }}>Event ID: {eventData.id}</p>

            <div className="event-details-card">
                <h3>Event Information</h3>
                {eventData.Image && ( 
                    <div className="event-image-wrapper">
                        <p className="details-line"><strong>Event Image:</strong></p>
                        <img
                            src={eventData.Image}
                            alt={`Image not Available`}
                            className="event-image-preview"
                        />
                    </div>
                )}
                <p className="details-line"><strong>Event Name:</strong> {eventData.eventName}</p>
                <p className="details-line"><strong>Description:</strong> {eventData.description}</p>
                <p className="details-line"><strong>Date:</strong> {formatTimestamp(eventData.date)}</p>
                <p className="details-line"><strong>Price:</strong> {eventData.Price}</p>
                <p className="details-line">
                    <strong>Current Status:</strong>
                    <span
                        className={`status-tag ${eventData.status === 'Accepted' ? 'status-accepted' :
                                eventData.status === 'Declined' ? 'status-declined' :
                                    'status-pending'
                            }`}
                    >
                        {eventData.status || 'Pending'}
                    </span>
                </p>
            </div>

            {userData ? (
                <div className="organizer-details-card">
                    <h3>Organizer Information</h3>
                    <p className="details-line"><strong>Name:</strong> {userData.name}</p>
                    <p className="details-line"><strong>Email:</strong> {userData.email}</p>
                    <p className="details-line"><strong>Phone:</strong> {userData.phoneNumber}</p>

                    {userData.organizer && (
                        <div style={{ marginTop: '10px' }}>
                            <h4>Company Details (Organizer Role)</h4>
                            <p className="details-line"><strong>Company Name:</strong> {userData.organizer.companyName}</p>
                            <p className="details-line"><strong>Position:</strong> {userData.organizer.position}</p>
                            <p className="details-line"><strong>Address:</strong> {userData.organizer.companyAddress}</p>
                            <p className="details-line"><strong>Validation Timestamp:</strong> {formatTimestamp(userData.organizer.validationTimestamp)}</p>
                            
                            {/* UPDATED SECTION START */}
                            <p className="details-line">
                                <strong>Organizer Status:</strong>
                                <span
                                    className={`status-tag ${
                                        userData.organizer.verified === 'Accepted' ? 'status-accepted' :
                                        (userData.organizer.verified === 'Declined' || userData.organizer.verified === 'Rejected') ? 'status-declined' :
                                        'status-pending'
                                    }`}
                                >
                                    {/* Changed from .status to .verified based on DB screenshot */}
                                    {userData.organizer.verified || 'Pending'}
                                </span>
                            </p>
                            {/* UPDATED SECTION END */}
                            
                        </div>
                    )}
                </div>
            ) : (
                <p>User data could not be loaded for the event organizer.</p>
            )}

            <div className="action-buttons-group">
                <button
                    onClick={() => handleVerify('Accepted')}
                    disabled={isSubmitting || eventData.status === 'Accepted'}
                    className="action-btn approve-btn"
                >
                    {isSubmitting ? 'Verifying...' : 'Approve Event'}
                </button>
                <button
                    onClick={() => handleVerify('Declined')}
                    disabled={isSubmitting || eventData.status === 'Declined'}
                    className="action-btn decline-btn"
                >
                    {isSubmitting ? 'Declining...' : 'Decline Event'}
                </button>
            </div>
        </div>
    );
}