import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useLocation } from "react-router-dom"; 
import { db } from "../firebase";
import EventCard from "./EventCard";
import "../css/EventsList.css";

export default function EventsList({
    collectionName = "events",
    onClickAction,
    ActionText,
    userId,
    userRole,
    categoryFilter = "all", // Used for Available Events
    timeFilter = "all"      // Used for Event History
}) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation(); 

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            console.log("Fetching events for role:", userRole, "and userId:", userId);
            try {
                let eventsData = [];
                const eventsCollection = collection(db, "events");
                

                if (userRole === "participant" && (location.pathname.includes("registration") || location.pathname.includes("history"))) {
                    const regQuery = query(
                        collection(db, "registrations"), 
                        where("userId", "==", userId)
                    );
                    const regSnapshot = await getDocs(regQuery);
                    const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);
                    
                    if (registeredEventIds.length === 0) {
                        setEvents([]);
                        setLoading(false);
                        return;
                    }
                    
                    const eventSnapshot = await getDocs(eventsCollection);
                    eventsData = eventSnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(event => registeredEventIds.includes(event.id));


                    if (timeFilter !== "all") {
                        const currentDate = new Date();
                        
                        eventsData = eventsData.filter(event => {
                            if (!event.date) return false;

                            let eventDate;
                            if (typeof event.date.toDate === 'function') {
                                eventDate = event.date.toDate(); 
                            } else {
                                eventDate = new Date(event.date); 
                            }

                            if (timeFilter === "upcoming") {
                                return eventDate >= currentDate;
                            } else if (timeFilter === "past") {
                                return eventDate < currentDate;
                            }
                            return true;
                        });
                    }
                }
                

                else {
                    const snapshot = await getDocs(eventsCollection);
                    let rawEvents = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    // Logic: Organizer
                    if (userRole === "organizer") {
                        eventsData = rawEvents.filter(event => event.userId === userId);
                    }

                    // Logic: Participant (Available Events)
                    else if (userRole === "participant") {
                        const regQuery = query(
                            collection(db, "registrations"), 
                            where("userId", "==", userId)
                        );
                        const regSnapshot = await getDocs(regQuery);
                        const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);

                        const currentDate = new Date();
                        
                        eventsData = rawEvents.filter(event => {
                            // Check A: Event Status MUST be Accepted
                            if (event.status !== 'Accepted') return false; 

                            // Check B: Event Date (Hide past events)
                            if (!event.date) return false; 
                            let eventDate;
                            if (typeof event.date.toDate === 'function') {
                                eventDate = event.date.toDate(); 
                            } else {
                                eventDate = new Date(event.date); 
                            }
                            if (eventDate <= currentDate) return false; 

                            // Check C: Registration Status (Hide already registered)
                            if (registeredEventIds.includes(event.id)) return false; 

                            // Check D: Category Filter
                            if (categoryFilter !== "all" && event.categoryId !== categoryFilter) {
                                return false;
                            }

                            return true;
                        });
                    }

                    // Logic: Admin (Show all)
                    else if (userRole === "admin") {
                        eventsData = rawEvents;
                    } 
                    
                    // Fallback
                    else {
                        eventsData = rawEvents;
                    }
                }

                setEvents(eventsData);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [collectionName, userId, userRole, location.pathname, categoryFilter, timeFilter]); // Added both filters to dependencies

    if (loading) return <p>Loading events...</p>;

    return (
        <div className="events-container">
            {events.length === 0 ? (
                <p>No events found.</p>
            ) : (
                <div className="events-grid">
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            onClick={onClickAction}
                            userRole={userRole}
                            buttonText={ActionText}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}