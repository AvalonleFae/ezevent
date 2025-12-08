import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import { db } from "../../firebase"; // Ensure this path is correct

export default function ValidateEventDetails() {
    const { id } = useParams(); // This is the Event Document ID
    const navigate = useNavigate();

    const [eventData, setEventData] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // New state for button loading

    const SERVICE_ID = "service_ezevent"; // Match the first file's service ID
    const TEMPLATE_ID = "template_3lwo8n3"; // Create a new template ID for events
    const PUBLIC_KEY = "tbsCwOVG73gOBa1XX"; // Match the first file's public key

    // Helper function to format Firestore Timestamp objects
    const formatTimestamp = (timestamp) => {
        if (timestamp && typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleString();
        }
        return 'N/A';
    };

    useEffect(() => {
        console.log("Current URL ID:", id); // Debugging: Check if ID exists

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
                    if (eventDetails.userid) {
                        const userRef = doc(db, 'users', eventDetails.userid);
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

        // Prompt for a reason if declining
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
                status: status, // 'Accepted' or 'Declined'
            });
            setEventData(prev => ({ ...prev, verified: status }));
            console.log(`Event status updated to: ${status}`);

            // 2. SEND EMAIL VIA EMAILJS
            const emailParams = {
                event_name: eventData.eventName,
                event_id: eventData.id,
                email: userData.email,
                name: userData.name,
                status: status,
                reason: reason,
                validation_link: window.location.href // Send the admin validation link for context/review
            };

            await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY)
                .then((response) => {
                    console.log('Event validation email sent successfully!', response.status, response.text);
                })
                .catch((err) => {
                    console.error('Failed to send event validation email. Error:', err);
                });

            // Optionally redirect after a brief success message
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
        <div style={{ padding: '20px' }}>
            <h2>Validate Event Details</h2>
            <p style={{ fontWeight: 'bold' }}>Event ID: {eventData.id}</p>



            {/* Display Event Information */}
            <div style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
                <h3>Event Information</h3>
                <p><strong>Event Name:</strong> {eventData.eventName}</p>
                <p><strong>Description:</strong> {eventData.description}</p>
                {/* FIX: Use formatTimestamp for date rendering */}
                <p><strong>Date:</strong> {formatTimestamp(eventData.date)}</p>
                <p><strong>Price:</strong> {eventData.Price}</p>
                <p><strong>Current Status:</strong>
                    <span style={{ fontWeight: 'bold', color: eventData.verified === 'Accepted' ? 'green' : eventData.verified === 'Declined' ? 'red' : 'orange' }}>
                        {eventData.verified || 'pending'}
                    </span>
                </p>
            </div>

            {/* Display User/Organizer Information */}
            {userData ? (
                <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                    <h3>Organizer Information</h3>
                    <p><strong>Name:</strong> {userData.name}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Phone:</strong> {userData.phoneNumber}</p>

                    {/* Accessing the nested 'organizer' map from your screenshot */}
                    {userData.organizer && (
                        <div style={{ marginTop: '10px' }}>
                            <h4>Company Details (Organizer Role)</h4>
                            <p><strong>Company Name:</strong> {userData.organizer.companyName}</p>
                            <p><strong>Position:</strong> {userData.organizer.position}</p>
                            <p><strong>Address:</strong> {userData.organizer.companyAddress}</p>
                            {/* FIX: Use formatTimestamp for validationTimestamp rendering */}
                            <p><strong>Validation Timestamp:</strong> {formatTimestamp(userData.organizer.validationTimestamp)}</p>
                            <p><strong>Organizer Status:</strong>
                                <span style={{ fontWeight: 'bold', color: userData.organizer.verified === 'Accepted' ? 'green' : 'orange' }}>
                                    {userData.organizer.verified || 'pending'}
                                </span>
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <p>User data could not be loaded for the event organizer.</p>
            )}
            <div style={{ margin: '20px 0', padding: '15px', border: '1px solid #007bff', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => handleVerify('Accepted')}
                    disabled={isSubmitting || eventData.verified === 'Accepted'}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {isSubmitting ? 'Verifying...' : 'Approve Event'}
                </button>
                <button
                    onClick={() => handleVerify('Declined')}
                    disabled={isSubmitting || eventData.verified === 'Declined'}
                    style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}
                >
                    {isSubmitting ? 'Declining...' : 'Decline Event'}
                </button>
            </div>
        </div>
    );
}