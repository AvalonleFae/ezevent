import React from 'react'
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
  const items = menuItems[role] || [];

  return (
    <aside className="sidebar">
        <div className="user-profile">
          <div className="user-name">John Doe</div>
          <div className="user-role">Admin</div>
        </div>
      <ul>
        {items.map((item) => (
          <div key={item.path}>
            <a href={item.path}>{item.label}</a>
          </div>
        ))}
      </ul>
      <div className="sidebar-signout">
        <a href="/signout">Sign Out</a>
      </div>
    </aside>
  );
}