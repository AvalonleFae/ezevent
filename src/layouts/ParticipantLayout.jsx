import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
import "../css/ParticipantPage.css";

function ParticipantsLayout() {
  return (
    <div className="admin-container">
      <Sidebar role="participant" />

      <div className="admin-content">
        <Routes>
          <Route path="home" element={<ViewEventsPage />} />
          <Route path="events" element={<ViewEventsPage />} />
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
