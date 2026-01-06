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
                        
                        // Apply time filter for organizer
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

                    // Logic: Participant (Available Events)
                    else if (userRole === "participant") {
                        const regQuery = query(
                            collection(db, "registrations"), 
                            where("userId", "==", userId)
                        );
                        const regSnapshot = await getDocs(regQuery);
                        const registeredEventIds = regSnapshot.docs.map(doc => doc.data().eventId);

                        const currentDate = new Date();
                        
                        // 1. Initial Synchronous Filter (Status, Date, Category, Not Joined)
                        const validCandidates = rawEvents.filter(event => {
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

                        // 2. Asynchronous Capacity Check
                        // We map the candidates to promises to check their specific registration counts
                        const finalEvents = await Promise.all(validCandidates.map(async (event) => {
                            const maxParticipants = event.numOfParticipants ? Number(event.numOfParticipants) : 0;

                            // If unlimited or invalid limit, we keep it
                            if (maxParticipants <= 0) return event;

                            // Query registrations for this specific event to get the count
                            const countQuery = query(
                                collection(db, "registrations"), 
                                where("eventId", "==", event.id)
                            );
                            const countSnapshot = await getDocs(countQuery);
                            const currentCount = countSnapshot.size;

                            // Only return event if current registrations are LESS than the limit
                            return currentCount < maxParticipants ? event : null;
                        }));

                        // Filter out the nulls (full events)
                        eventsData = finalEvents.filter(e => e !== null);
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
    }, [collectionName, userId, userRole, location.pathname, categoryFilter, timeFilter]); 

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