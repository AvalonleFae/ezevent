import React, { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from "react-router-dom";
import '../css/Sidebar.css'



const menuItems = {
  participant: [
    { label: "Home", path: "/participant/home" },
    { label: "My Events", path: "/participant/events" },
  ],
  admin: [
    { label: "Management Report", path: "/admin/management-report" },
    { label: "Validate Organizers", path: "/admin/validate-organizers" },
    { label: "Validate Events", path: "/admin/validate-events" },
    { label: "Validate Participants", path: "/admin/validate-participants" }
  ],
  organizer: [
    { label: "Create Event", path: "/organizer/create" },
    { label: "My Events", path: "/organizer/events" },
  ]
};

export default function Sidebar({ role }) {

    const navigate = useNavigate();
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
                name: userDoc.data().name || 'User',
                role: userDoc.data().role || 'participant'
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
      navigate("/login");
    }catch (error) {
      console.error("Error Logging out:", error.message)
    }
  }

  const items = menuItems[role] || [];

  return (
    <aside className="sidebar">
        <div className="user-profile">
          <div className="user-name">{userData.name}</div>
          <div className="user-role">{userData.role}</div>
        </div>
      <ul>
        {items.map((item) => (
          <div key={item.path}>
            <a href={item.path}>{item.label}</a>
          </div>
        ))}
      </ul>
      <div className="sidebar-signout">
        <a onClick={handleLogout}>Sign Out</a>
      </div>
    </aside>
  );
}