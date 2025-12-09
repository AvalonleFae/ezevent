import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
<<<<<<< HEAD
import EventDetailsPage from "../pages/User/EventDetailsPage";
=======
import ParticipantPage from "../pages/Participant/ParticipantPage";
>>>>>>> d721474ff29d7c3a5ab174bbcf9f747bc3539d31
import "../css/ParticipantPage.css";

function ParticipantsLayout() {
  return (
    <div className="participant-container">
      <Sidebar role="participant" />

      <div className="participant-content">
        <Routes>
<<<<<<< HEAD
          <Route index element={<ViewEventsPage />} />
          <Route path="events" element={<ViewEventsPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
=======
          <Route path="" element={<ParticipantPage />} />
          <Route path="events" element={<ParticipantPage />} />
          <Route
            path="registered"
            element={
              <div>
                <h1>My Registrations</h1>
                <p>Coming soon...</p>
              </div>
            }
          />
>>>>>>> d721474ff29d7c3a5ab174bbcf9f747bc3539d31
        </Routes>
      </div>
    </div>
  );
}

export default ParticipantsLayout;
