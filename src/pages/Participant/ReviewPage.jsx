import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp,
    query,
    where,
    getDocs
} from "firebase/firestore";
import { useAuth } from "../../components/AuthContext";
import "../../css/ReviewPage.css";

const ReviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [recommend, setRecommend] = useState("Yes");
    const [objective, setObjective] = useState("Yes");

    useEffect(() => {
        const verifyAttendanceAndFetchData = async () => {
            if (!user) return;

            try {

                const regQuery = query(
                    collection(db, "registrations"),
                    where("eventId", "==", id),
                    where("userId", "==", user.uid)
                );

                const regSnap = await getDocs(regQuery);

                if (regSnap.empty) {
                    alert("You are not registered for this event.");
                    navigate("/participant/history");
                    return;
                }


                const registrationDocId = regSnap.docs[0].id;
                const attendanceRef = collection(db, "registrations", registrationDocId, "attendance");


                const attendanceQuery = query(attendanceRef, where("status", "==", "present"));
                const attendanceSnap = await getDocs(attendanceQuery);

                if (attendanceSnap.empty) {
                    alert("Access Denied: You must scan the QR code at the event to leave a review.");
                    navigate("/participant/history");
                    return;
                }


                setIsAuthorized(true);
                const eventRef = doc(db, "events", id);
                const eventSnap = await getDoc(eventRef);

                if (eventSnap.exists()) {
                    setEvent({ id: eventSnap.id, ...eventSnap.data() });
                }

            } catch (error) {
                console.error("Verification error:", error);
                alert("An error occurred while verifying your attendance.");
                navigate("/participant/history");
            } finally {
                setLoading(false);
            }
        };

        verifyAttendanceAndFetchData();
    }, [id, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user || !isAuthorized) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "events", id, "review"), {
                partid: user.uid,
                userName: user.displayName || "Anonymous",
                rating: Number(rating),
                message: comment,
                recommend,
                objective,
                timestamp: serverTimestamp(),
            });
            alert("Review submitted successfully!");
            navigate("/participant/history");
        } catch (error) {
            console.error("Error adding review:", error);
            alert("Failed to submit review.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="review-loading">Verifying attendance record...</div>;


    if (!isAuthorized) return null;

    return (
        <div className="review-page-container">
            <div className="review-card glass-morphism">
                <div className="review-header">
                    <h1 className="tbhx-header">RATE <span className="text-glow">EVENT</span></h1>
                    <p className="event-name-subtitle">{event?.eventName}</p>
                    <div className="header-accent"></div>
                </div>

                <form onSubmit={handleSubmit} className="review-form">
                    <div className="form-section">
                        <label>Overall Experience</label>
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${rating >= star ? "filled" : ""}`}
                                    onClick={() => setRating(star)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-section">
                            <label htmlFor="recommend">Recommend this event?</label>
                            <select
                                id="recommend"
                                value={recommend}
                                onChange={(e) => setRecommend(e.target.value)}
                                className="tbhx-input"
                            >
                                <option value="Yes">Yes, absolutely</option>
                                <option value="Maybe">Maybe</option>
                                <option value="No">No</option>
                            </select>
                        </div>

                        <div className="form-section">
                            <label htmlFor="objective">Event Objective Achieved?</label>
                            <select
                                id="objective"
                                value={objective}
                                onChange={(e) => setObjective(e.target.value)}
                                className="tbhx-input"
                            >
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-section">
                        <label htmlFor="comment">Your Feedback</label>
                        <textarea
                            id="comment"
                            placeholder="Tell us what you liked or what could be improved..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="tbhx-textarea"
                            required
                        ></textarea>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="tbhx-button secondary"
                            onClick={() => navigate("/participant/history")}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            className="tbhx-button"
                            disabled={submitting}
                        >
                            {submitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewPage;