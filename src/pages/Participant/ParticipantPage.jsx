import React, { useState, useEffect } from "react";
import EventsList from "../../components/EventsList";
import { useAuth } from "../../components/AuthContext";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore"; 
import { db } from "../../firebase"; 
import "../../css/ParticipantPage.css";

export default function ParticipantPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "eventCategories"));
        const cats = querySnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().categoryName 
        }));
        setCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleClick = async (event) => {
    console.log("Getting Event Details:", event.id);
    navigate(`/participant/events/${event.id}`);
  };

  return (
    <div className="participant-container">
      <main className="participant-content">
        <div className="participant-header">
          <div className="participant-profile">
            <h1>Available Events</h1>
          </div>
          <div className="participant-divider"></div>
        </div>

        {/* Updated Filter Container with Classes */}
        <div className="filter-container">
          <label htmlFor="category-select" className="filter-label">
            Filter by Category:
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="participant-main">
          <EventsList
            collectionName="events"
            onClickAction={handleClick}
            ActionText="Details"
            userRole="participant"
            userId={user ? user.uid : ""}
            categoryFilter={selectedCategory} 
          />
        </div>
      </main>
    </div>
  );
}