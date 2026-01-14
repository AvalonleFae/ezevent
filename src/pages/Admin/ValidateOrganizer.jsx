import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import emailjs from '@emailjs/browser';
import "../../css/ValidateOrganizer.css";
import '../../css/TbhxDataTable.css';
import DataTable, { createTheme } from 'react-data-table-component';

export default function ValidateOrganizer() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterText, setFilterText] = useState('');

  const SERVICE_ID = "service_ezevent";
  const TEMPLATE_ID = "template_2ofdmnb";
  const PUBLIC_KEY = "tbsCwOVG73gOBa1XX";

  useEffect(() => {
    const fetchOrganizers = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersCollection = collection(db, 'users');
        const q = query(usersCollection, where('role', '==', 'organizer'));
        const usersSnapshot = await getDocs(q);

        const organizersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrganizers(organizersList);
      } catch (err) {
        console.error('Error fetching organizers:', err);
        setError('Failed to load organizers.');
        setOrganizers([]);
      } finally {
        setLoading(false);
      }



    };
    fetchOrganizers();
  }, []);




  const handleValidation = async (organizerId, currentStatus, email, name) => {
    const newStatus = prompt(`Current: ${currentStatus}. Type 'accept' or 'decline':`).toLowerCase();

    if (newStatus !== 'accept' && newStatus !== 'decline') {
      alert('Invalid status. Please type "accept" or "decline".');
      return;
    }


    let rejectionReason = '';

    if (newStatus === 'accept' || newStatus === 'decline') {
      const statusToSet = newStatus === 'accept' ? 'Accepted' : 'Declined';

      if (newStatus === 'decline') {
        rejectionReason = prompt('Please provide a reason for declining the organizer:');
        if (!rejectionReason) {
          alert('Decline reason is required.');
          return;
        }
      }

      try {
        const organizerRef = doc(db, 'users', organizerId);
        const updateData = {
          "organizer.verified": statusToSet,
          "organizer.validationTimestamp": serverTimestamp()
        };
        if (newStatus === 'decline') {
          updateData["organizer.declineReason"] = rejectionReason;
        }
        await updateDoc(organizerRef, updateData);

        setOrganizers(prev =>
          prev.map(org =>
            org.id === organizerId
              ? {
                ...org, // 1. Keep the outer user data (id, email, name, etc.)
                organizer: {
                  ...org.organizer, // 2. Keep the existing company info
                  verified: statusToSet, // 3. Update ONLY the verified status
                  ...(newStatus === 'decline' ? { declineReason: rejectionReason } : {})
                }
              }
              : org
          )
        );
        alert(`Organizer ${statusToSet}.`);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to update status.');
      }

      // 5. SEND EMAIL VIA EMAILJS (Client Side)
      const emailParams = {
        email: email,
        name: name,
        status: statusToSet,
        reason: rejectionReason || "All data correct."
      };

      await emailjs.send(SERVICE_ID, TEMPLATE_ID, emailParams, PUBLIC_KEY)
        .then((response) => {
          console.log('Email sent successfully!', response.status, response.text);
        })
        .catch((err) => {
          console.error('Failed to send email. Error:', err);
        });

    }
  };

  // Filter organizers based on status
  const filteredOrganizers = organizers.filter(org => {
    const status = org.organizer?.verified || 'Pending';
    const statusOk = statusFilter === 'All' || status === statusFilter;
    if (!statusOk) return false;

    const haystack = `${org?.name || ''} ${org?.email || ''} ${org?.phoneNumber || ''} ${org?.organizer?.companyName || ''} ${org?.organizer?.address || ''} ${org?.organizer?.position || ''}`
      .toLowerCase();
    return haystack.includes(filterText.toLowerCase());
  });

  const handleFilterChange = (value) => {
    setStatusFilter(value);
  };

  const columns = [
    { name: 'ID', selector: row => row.id, sortable: true, wrap: true },
    { name: 'EMAIL', selector: row => row.email || 'N/A', sortable: true, wrap: true },
    { name: 'NAME', selector: row => row.name || 'N/A', sortable: true, wrap: true },
    { name: 'PHONE NO.', selector: row => row.phoneNumber || 'N/A', sortable: true, wrap: true},
    { name: 'COMPANY NAME', selector: row => row.organizer?.companyName || 'N/A', sortable: true, wrap: true, width: '200px', minWidth: '180px' },
    { name: 'COMPANY ADDRESS', selector: row => row.organizer?.address || 'N/A', sortable: true, wrap: true, width: '280px', minWidth: '250px' },
    { name: 'POSITION', selector: row => row.organizer?.position || 'N/A', sortable: true, wrap: true },
    {
      name: 'STATUS',
      cell: row => (
        <span className={`status-tag ${row.organizer?.verified ? row.organizer.verified.toLowerCase() : 'pending'}`}>
          {row.organizer?.verified || 'Pending'}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'ACTION',
      cell: row => (
        <button
          type="button"
          className="action-btn edit-btn"
          onClick={() =>
            handleValidation(
              row.id,
              row.organizer?.verified || 'Pending',
              row.email,
              row.name,
            )
          }
        >
          Validate
        </button>
      ),
    },
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

      <select
        id="statusFilter"
        value={statusFilter}
        onChange={e => handleFilterChange(e.target.value)}
        style={{ padding: '0.7rem 0.9rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}
      >
        <option value="All">All</option>
        <option value="Pending">Pending</option>
        <option value="Accepted">Accepted</option>
        <option value="Declined">Declined</option>
      </select>
    </div>
  );

  return (
    <div className="manage-organizer">
      <h1>Validate Organizers</h1>

      <section className="organizer-list-section">
        <h2>Organizers List</h2>
        {loading ? (
          <p>Loading Organizers...</p>
        ) : (
          <DataTable
            columns={columns}
            data={filteredOrganizers}
            pagination
            responsive
            subHeader
            subHeaderComponent={subHeaderComponent}
            theme="tbhxTheme"
            noDataComponent={
              <div style={{ padding: '2rem', textAlign: 'center', width: '100%' }}>
                No Organizers found
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