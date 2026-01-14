import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import "../../css/ViewParticipantsPage.css";
import '../../css/TbhxDataTable.css';
import DataTable, { createTheme } from 'react-data-table-component';

export default function ViewParticipants() {
  const [participant, setParticipant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterText, setFilterText] = useState('');



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

  const filteredParticipants = participant.filter(p => {
    const haystack = `${p?.name || ''} ${p?.email || ''} ${p?.participant?.institution || ''} ${p?.participant?.matricNumber || ''}`
      .toLowerCase();
    return haystack.includes(filterText.toLowerCase());
  });

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true, wrap: true },
    { name: 'EMAIL', selector: row => row.email || 'N/A', sortable: true, wrap: true },
    { name: 'NAME', selector: row => row.name || 'N/A', sortable: true, wrap: true },
    { name: 'AGE', selector: row => row.age || 'N/A', sortable: true },
    { name: 'PHONE NUMBER', selector: row => row.phoneNumber || 'N/A', sortable: true, wrap: true },
    { name: 'GENDER', selector: row => row.gender || 'N/A', sortable: true },
    { name: 'INSTITUTION', selector: row => row.participant?.institution || 'N/A', sortable: true, wrap: true },
    { name: 'MATRIC NUMBER', selector: row => row.participant?.matricNumber || 'N/A', sortable: true, wrap: true },
  ];

  const subHeaderComponent = (
    <div className="subheader-container">
      <input
        type="text"
        placeholder="SEARCH..."
        className="search-input"
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
      />
    </div>
  );

  return (
    <div className="view-participants">
      <h1>View Participants</h1>

      <section className="participant-list-section">
        <h2>Participants List</h2>
        {loading ? (
          <p>Loading Participants...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredParticipants}
            pagination
            responsive
            subHeader
            subHeaderComponent={subHeaderComponent}
            theme="tbhxTheme"
            noDataComponent={
              <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                No Participants found
              </div>
            }
          />
        )}
      </section>

    </div>
  );
}

createTheme('tbhxTheme', {
  text: {
    primary: '#FFFFFF',
    secondary: '#AAAAAA',
  },
  background: {
    default: 'transparent',
  },
  context: {
    background: '#FF4040',
    text: '#FFFFFF',
  },
  divider: {
    default: 'rgba(255, 64, 64, 0.2)',
  },
  highlightOnHover: {
    default: 'rgba(255, 64, 64, 0.1)',
    text: '#FFFFFF',
  },
  striped: {
    default: 'rgba(255, 255, 255, 0.02)',
    text: '#FFFFFF',
  },
});