import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
import EventDetailsPage from "../pages/User/EventDetailsPage";
import "../css/ParticipantPage.css";

function ParticipantsLayout() {
  return (
    <div className="participant-container">
      <Sidebar role="participant" />

      <div className="participant-content">
        <Routes>
          <Route index element={<ViewEventsPage />} />
          <Route path="events" element={<ViewEventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default ParticipantsLayout;
