import React, { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import '../css/Sidebar.css'


// Define menu items for each role
const menuItems = {
  participant: [
    { label: "View Events", path: "/participant/events" },
    { label: "My Event History", path: "/participant/history" },
    { label: "Messages", path: "/participant/chat" },
    { label: "Scan Attendance QR", path: "/participant/scan-attendance" }
  ],
  admin: [
    { label: "Management Report", path: "/admin/management-report" },
    { label: "Validate Organizers", path: "/admin/validate-organizers" },
    { label: "Validate Events", path: "/admin/validate-events" },
    { label: "View Participants", path: "/admin/view-participants" },
    { label: "Manage Univerisities", path: "/admin/manage-universities" }

  ],
  organizer: [
    { label: "My Events", path: "/organizer/my-events" },
    { label: "Create Event", path: "/organizer/create-event" },
    { label: "Messages", path: "/organizer/chat" },
  ]
};

// Sidebar component
export default function Sidebar({ role }) {


  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState({ name: '', role: '' });  // State to hold user data
  const [loading, setLoading] = useState(true);


  // Fetch user data on component mount
  useEffect(() => {
    // Function to fetch user data from Firestore
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData({
              name: userDoc.data().name || null,
              role: userDoc.data().role || null
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const [isOpen, setIsOpen] = useState(false);

  // Handle user logout
  async function handleLogout() {
    try {
      await signOut(auth);
      console.log("User logged out successfully!")
      navigate("/");
    } catch (error) {
      console.error("Error Logging out:", error.message)
    }
  }

  // Prefer the role from the fetched user document when available;
  // fall back to the role prop passed by the layout.
  const effectiveRole = userData.role || role;
  const items = menuItems[effectiveRole] || [];

  // Helper to check if item should be active (for base routes)
  const getActiveClassName = ({ isActive }, itemPath) => {
    // If on base route, highlight first menu item
    if (role === 'admin' && location.pathname === '/admin' && itemPath === '/admin/management-report') {
      return 'active';
    }
    if (role === 'participant' && location.pathname === '/participant' && itemPath === '/participant/home') {
      return 'active';
    }
    if (role === 'organizer' && location.pathname === '/organizer' && itemPath === '/organizer/events') {
      return 'active';
    }
    return isActive ? 'active' : '';
  };

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="user-profile">
          <div className="user-name">{userData.name}</div>
          <div className="user-role">{userData.role}</div>
        </div>
        <ul>
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={(navData) => getActiveClassName(navData, item.path)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="sidebar-signout">
          <a onClick={handleLogout}>Sign Out</a>
        </div>
      </aside>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}