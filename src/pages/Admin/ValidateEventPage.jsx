import React, { useState } from "react";
import EventsList from "../../components/EventsList";
import { useNavigate } from "react-router-dom";
import "../../css/ValidateEventPage.css";
import { useAuth } from "../../components/AuthContext";
export default function ValidateEventPage() {

    const navigate = useNavigate()
    const {user} = useAuth()
    const [statusFilter, setStatusFilter] = useState('All');

    const handleClick = (event) => {
        console.log("Event clicked:", event.id)
        navigate(`/admin/validate-events/${event.id}`)
    }
    return (
        <div className="validate-event">
            <h1>Validate Events</h1>
            <div style={{ marginBottom: '1rem' }}>
                <label htmlFor="statusFilter" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ padding: '0.3rem 0.7rem', borderRadius: '4px' }}
                >
                    <option value="All">All</option>
                    <option value="pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Declined">Declined</option>
                </select>
            </div>
            <EventsList
                collectionName="events"
                onClickAction={handleClick}
                ActionText="Details"
                userRole="admin"
                userId={user ? user.uid : ""}
                statusFilter={statusFilter}
            />
        </div>
    )
}
