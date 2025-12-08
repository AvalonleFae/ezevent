import React from "react";
import EventsList from "../../components/EventsList";
import { useNavigate } from "react-router-dom";

export default function ValidateEventPage() {

    const navigate = useNavigate();

    const handleClick = (event) => {
        console.log("Event clicked:", event.id);
        navigate(`/admin/validate-events/${event.id}`)
    }
    return (
        <div>
            <h1>Validate Events</h1>
            <EventsList
                collectionName="events"
                onClickAction={handleClick}
                ActionText="Details"
            />
        </div>
    )
}
