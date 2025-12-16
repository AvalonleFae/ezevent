import Sidebar from "../components/Sidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import ViewEventsPage from "../pages/ViewEventPage";
import EventDetailsPage from "../pages/Participant/EventDetailsPage";
import ParticipantPage from "../pages/Participant/ParticipantPage";
import EventHistoryPage from "../pages/Participant/EventHistoryPage"; // 1. Import the new page
import SuccessPage from "../pages/Participant/SuccessPage";
import ReceiptPage from "../pages/Participant/ReceiptPage";
import "../css/ParticipantPage.css";
import ScanAttendance from "../pages/Participant/ScanAttendance";

function ParticipantsLayout() {
  const location = useLocation();
  const isScanning = location.pathname.includes("scan-attendance");

  return (
    <div className="participant-container">

      {!isScanning && <Sidebar role="participant" />}


      <div className="participant-content">
        <Routes>
          <Route path="" element={<ParticipantPage />} />
          <Route path="events" element={<ParticipantPage />} />
          <Route path="events/success" element={<SuccessPage />} />
          <Route path="events/:id" element={<EventDetailsPage />} />
          <Route path="history/receipt/:id" element={<EventDetailsPage />} />
          <Route path="history/receipt/ticket/:id" element={<ReceiptPage />} />
          <Route path="history" element={<EventHistoryPage />} /> 
           <Route path="events/success" element={<SuccessPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="scan-attendance" element={<ScanAttendance />} />
          
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