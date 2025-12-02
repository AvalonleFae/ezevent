import Sidebar from "../components/Sidebar";
import AdminPage from "../pages/AdminPage";
import ManageUniversityPage from "../pages/ManageUniversityPage";
import ManageFacultiesPage from "../pages/ManageFacultiesPage";
import {Routes, Route} from "react-router-dom";
import "../css/AdminPage.css";
import ValidateOrganizer from "../pages/ValidateOrganizer";


function AdminLayout() {
    return (
        <div className="admin-container">
            <Sidebar role="admin" />
            <div className="admin-content">
            <Routes>
                <Route path="" element={<AdminPage />} />
                <Route path="management-report" element={<AdminPage />} />
                <Route path="validate-organizers" element={<ValidateOrganizer />} />
                <Route path="validate-events" element={<AdminPage />} />
                <Route path="validate-participants" element={<AdminPage />} />
                <Route path="manage-universities" element={<ManageUniversityPage />} />
                <Route path="manage-faculties/:universityId" element={<ManageFacultiesPage />} />      
            </Routes>

            </div>
        </div>
    )
}

export default AdminLayout;