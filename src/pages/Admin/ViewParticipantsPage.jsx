import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import "../../css/ViewParticipantsPage.css";

export default function ViewParticipants() {
  const [participant, setParticipant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;



  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('role', '==', 'participant'));
        const usersSnapshot = await getDocs(q);

        const participantsList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setParticipant(participantsList);
      } catch (err) {
        console.error('Error fetching participants:', err);
        setError('Failed to load participants.');
        setParticipant([]);
      } finally {
        setLoading(false);
      }



    };
    fetchParticipants();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(participant.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParticipants = participant.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="view-participants">
      <h1>View Participants</h1>

      <section className="participant-list-section">
        <h2>Participants List</h2>
        {loading ? (
          <p>Loading Participants...</p>
        ) : (
          <div className='table-container'>
            <table className="participants-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Phone Number</th>
                  <th>Gender</th>
                  <th>Institution</th>
                  <th>Matric Number</th>

                </tr>
              </thead>
              <tbody>
                {participant.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      No Participants found
                    </td>
                  </tr>
                ) : (
                  currentParticipants.map((participant) => (
                    <tr key={participant.id}>
                      <td data-label="ID">{participant.id}</td>
                      <td data-label="Email">{participant.email || 'N/A'}</td>
                      <td data-label="Name">{participant.name || 'N/A'}</td>
                      <td data-label="Age">{participant.age || 'N/A'}</td>
                      <td data-label="Phone">{participant.phoneNumber || 'N/A'}</td>
                      <td data-label="Gender">{participant.gender || 'N/A'}</td>
                      <td data-label="Institution">{participant.participant.institution || 'N/A'}</td>
                      <td data-label="Matric No">{participant.participant.matricNumber || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {!loading && participant.length > 0 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

    </div>
  );
}