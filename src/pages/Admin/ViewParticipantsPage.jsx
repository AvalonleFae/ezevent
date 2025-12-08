import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import emailjs from '@emailjs/browser';
import "../css/ViewParticipantsPage.css";
import { SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY } from "../../emailjs-config";

export default function ViewParticipants() {
  const [participant, setParticipant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);



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


  return (
    <div className="view-participants">
      <h1>View Participants</h1>

      <section className="participant-list-section">
        <h2>Participants List</h2>
        {loading ? (
          <p>Loading Participants...</p>
        ) : (
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
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No Participants found
                  </td>
                </tr>
              ) : (
                participant.map((participant) => (
                  <tr key={participant.id}>
                    <td>{participant.id}</td>
                    <td>{participant.email || 'N/A'}</td>
                    <td>{participant.name || 'N/A'}</td>
                    <td>{participant.age || 'N/A'}</td>
                    <td>{participant.phoneNumber || 'N/A'}</td>
                    <td>{participant.gender || 'N/A'}</td>
                    <td>{participant.participant.institution || 'N/A'}</td>
                    <td>{participant.participant.matricNumber || 'N/A'}</td>
                    <td>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </section>

    </div>
  );
}