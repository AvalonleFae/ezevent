import Sidebar from "../components/Sidebar";
import { Routes, Route } from "react-router-dom";
import OrganizerPage from "../pages/Organizer/OrganizerPage";
import CreateEvent from "../pages/Organizer/CreateEventPage";
import EventDashboard from "../pages/Organizer/EventDashboard";
import AttendanceList from "../pages/Organizer/AttendanceList";

function OrganizerLayout() {
  return (
    <div className="organizer-container">
      <Sidebar role="organizer" />

      <div className="organizer-content">
        <Routes>
          <Route path="" element={<OrganizerPage />} />
          <Route path="my-events" element={<OrganizerPage />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="my-event/:id/dashboard" element={<EventDashboard />} />
          <Route path="my-event/:id/attendance-list" element={<AttendanceList />} />
        </Routes>
      </div>
    </div>
  );
}

export default OrganizerLayout;
