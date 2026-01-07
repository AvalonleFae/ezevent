import React from "react";
import EventsList from "../../components/EventsList";
import { useNavigate } from "react-router-dom";
import "../../css/ValidateEventPage.css";
import { useAuth } from "../../components/AuthContext";
export default function ValidateEventPage() {

    const navigate = useNavigate()

    const {user} = useAuth()

    const handleClick = (event) => {
        console.log("Event clicked:", event.id)
        navigate(`/admin/validate-events/${event.id}`)
    }
    return (
        <div className="validate-event">
            <h1>Validate Events</h1>
            <EventsList
                collectionName="events"
                onClickAction={handleClick}
                ActionText="Details"
                userRole="admin"
                userId={user ? user.uid : ""}
            />
        </div>
    )
}
