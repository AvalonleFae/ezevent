import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../css/ManageUniversity.css';

export default function ManageUniversityPage() {
  const navigate = useNavigate();
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [universityId, setUniversityId] = useState('');
  const [universityName, setUniversityName] = useState('');

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const universitiesCollection = collection(db, 'universities');
        const universitiesSnapshot = await getDocs(universitiesCollection);
        const universitiesList = universitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUniversities(universitiesList);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);


const isValidId = (value) => {
  // Reject if it contains any lowercase a–z
  return !/[a-z]/.test(value);
  // Alternative stricter rule:
  // return /^[A-Z0-9-]+$/.test(value);
};


  const handleNewUniversity = async (e) => {
    e.preventDefault();
    if (!universityId.trim() || !universityName.trim() ) {
      return;
    }

  // NEW: validation — reject lowercase


  if(!isValidId(universityId.trim())) {
      window.alert('University ID cannot contain lowercase letters.');
      return;
    }

    try {
      const universityDoc = doc(db, 'universities', universityId.trim());
      await setDoc(universityDoc, {
        universityName: universityName.trim(),
        createdAt: serverTimestamp()
      });

      setUniversities((prev) => [
        ...prev,
        {
          id: universityId.trim(),
          universityName: universityName.trim()
        }
      ]);
      window.alert('University added successfully.');
      setUniversityId('');
      setUniversityName('');


    } catch (error) {
      console.error('Error adding university:', error);
    }
  };

  const handleDelete = async (id, universityName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${universityName || id}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const universityDoc = doc(db, 'universities', id);
      await deleteDoc(universityDoc);

      setUniversities((prev) => prev.filter((university) => university.id !== id));
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university. Please try again.');
    }
  };

  return (
    <div className="manage-university">
      <h1>Manage Universities</h1>

      <section className="universities-list-section">
        <h2>Universities List</h2>
        {loading ? (
          <p>Loading universities...</p>
        ) : (
          <table className="universities-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>University Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {universities.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No universities found
                  </td>
                </tr>
              ) : (
                universities.map((university) => (
                  <tr key={university.id}>
                    <td>{university.id}</td>
                    <td>{university.universityName || 'N/A'}</td>
                    <td>
                      <button 
                        type="button" 
                        className="action-btn edit-btn"
                        onClick={() => navigate(`/admin/manage-faculties/${university.id}`)}
                      >
                        Faculties
                      </button>
                      <button 
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(university.id, university.universityName)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

      <section className="add-university-section">
        <h2>Add New University</h2>
        <form onSubmit={handleNewUniversity}>
          <div className="form-field">
            <label htmlFor="university-id">University ID:</label>
            <input
              type="text"
              id="university-id"
              name="universityId"
              className="form-control"
              placeholder="Enter University ID"
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="university-name">University Name:</label>
            <input
              type="text"
              id="university-name"
              name="universityName"
              className="form-control"
              placeholder="Enter university name"
              value={universityName}
              onChange={(e) => setUniversityName(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="action-btn primary-btn">
              Add University
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
