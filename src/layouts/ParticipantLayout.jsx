import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
import EventDetailsPage from "../pages/Participant/EventDetailsPage";
import ParticipantPage from "../pages/Participant/ParticipantPage";
import "../css/ParticipantPage.css";
import SuccessPage from "../pages/Participant/SuccessPage";

function ParticipantsLayout() {
  return (
    <div className="participant-container">
      <Sidebar role="participant" />

      <div className="participant-content">
        <Routes>
          <Route path="" element={<ParticipantPage />} />
          <Route path="events" element={<ParticipantPage />} />
           <Route path="events/success" element={<SuccessPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route
            path="registered"
            element={
              <div>
                <h1>My Registrations</h1>
                <p>Coming soon...</p>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

export default ParticipantsLayout;
