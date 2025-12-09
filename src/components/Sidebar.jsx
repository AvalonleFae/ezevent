import React, { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import '../css/Sidebar.css'



const menuItems = {
  participant: [
    { label: "View Events", path: "/participant/events" },
    { label: "My Registrations", path: "/participant/registered" }
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
  ]
};

export default function Sidebar({ role }) {

    const navigate = useNavigate();
    const location = useLocation();
    const [userData, setUserData] = useState({ name: '', role: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

  async function handleLogout() {
    try{
      await signOut(auth);
      console.log("User logged out successfully!")
      navigate("/");
    }catch (error) {
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
    <aside className="sidebar">
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
  );
}