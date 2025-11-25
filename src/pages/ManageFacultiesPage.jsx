import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, deleteDoc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import '../css/ManageFaculties.css';

export default function ManageFacultiesPage() {
  const { universityId } = useParams();
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [facultyId, setFacultyId] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [universityName, setUniversityName] = useState('');

  useEffect(() => {
    const fetchFacultiesAndUniversity = async () => {
      try {
        // Fetch university name
        const universityDoc = doc(db, 'universities', universityId);
        const universitySnapshot = await getDocs(collection(db, 'universities'));
        const university = universitySnapshot.docs.find(doc => doc.id === universityId);
        if (university) {
          setUniversityName(university.data().universityName);
        }

        // Fetch faculties for this university
        const facultiesCollection = collection(db, 'universities', universityId, 'faculties');
        const facultiesSnapshot = await getDocs(facultiesCollection);
        const facultiesList = facultiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFaculties(facultiesList);
      } catch (error) {
        console.error('Error fetching faculties:', error);
      } finally {
        setLoading(false);
      }
    };

    if (universityId) {
      fetchFacultiesAndUniversity();
    }
  }, [universityId]);

const isValidId = (value) => {
  // Reject if it contains any lowercase a–z
  return !/[a-z]/.test(value);
  // Alternative stricter rule:
  // return /^[A-Z0-9-]+$/.test(value);
};

  const handleNewFaculty = async (e) => {
    e.preventDefault();
    if (!facultyId.trim() || !facultyName.trim()) {
      return;
    }

      if(!isValidId(facultyId.trim())) {
      window.alert('Faculty ID cannot contain lowercase letters.');
      return;
    }

    try {
      const facultyDoc = doc(db, 'universities', universityId, 'faculties', facultyId.trim());
      await setDoc(facultyDoc, {
        facultyName: facultyName.trim(),
        createdAt: serverTimestamp()
      });

      setFaculties((prev) => [
        ...prev,
        {
          id: facultyId.trim(),
          facultyName: facultyName.trim()
        }
      ]);

      setFacultyId('');
      setFacultyName('');

      window.alert('Faculty added successfully.');
    } catch (error) {
      console.error('Error adding faculty:', error);
    }
  };

  const handleDelete = async (id, facultyName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${facultyName || id}"? This action cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const facultyDoc = doc(db, 'universities', universityId, 'faculties', id);
      await deleteDoc(facultyDoc);

      setFaculties((prev) => prev.filter((faculty) => faculty.id !== id));


    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Failed to delete faculty. Please try again.');
    }
  };

  const handleBackToUniversities = () => {
    navigate('/admin/manage-universities');
  };

  return (
    <div className="manage-faculties">
      <div className="faculties-header">
        <button 
          type="button" 
          className="back-btn"
          onClick={handleBackToUniversities}
        >
          ← Back to Universities
        </button>
        <h1>Manage Faculties - {universityName}</h1>
      </div>

      <section className="faculties-list-section">
        <h2>Faculties List</h2>
        {loading ? (
          <p>Loading faculties...</p>
        ) : (
          <table className="faculties-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Faculty Name</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {faculties.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No faculties found
                  </td>
                </tr>
              ) : (
                faculties.map((faculty) => (
                  <tr key={faculty.id}>
                    <td>{faculty.id}</td>
                    <td>{faculty.facultyName || 'N/A'}</td>
                    <td>
                      <button 
                        type="button"
                        className="action-btn delete-btn"
                        onClick={() => handleDelete(faculty.id, faculty.facultyName)}
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

      <section className="add-faculty-section">
        <h2>Add New Faculty</h2>
        <form onSubmit={handleNewFaculty}>
          <div className="form-field">
            <label htmlFor="faculty-id">Faculty ID:</label>
            <input
              type="text"
              id="faculty-id"
              name="facultyId"
              className="form-control"
              placeholder="Enter Faculty ID"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="faculty-name">Faculty Name:</label>
            <input
              type="text"
              id="faculty-name"
              name="facultyName"
              className="form-control"
              placeholder="Enter faculty name"
              value={facultyName}
              onChange={(e) => setFacultyName(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="action-btn primary-btn">
              Add Faculty
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
