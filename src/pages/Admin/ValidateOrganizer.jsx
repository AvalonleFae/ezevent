import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import emailjs from '@emailjs/browser';
import "../../css/ValidateOrganizer.css";

export default function ValidateOrganizer() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

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

  return (
    <div className="manage-organizer">
      <h1>Validate Organizers</h1>

      <section className="organizer-list-section">
        <h2>Organizers List</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="statusFilter" style={{ marginRight: '0.5rem' }}>Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '0.3rem 0.7rem', borderRadius: '4px' }}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>
        </div>
        {loading ? (
          <p>Loading Organizers...</p>
        ) : (
          <div className='table-container'>
            <table className="organizer-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Phone Number</th>
                  <th>Company Name</th>
                  <th>Company Address</th>
                  <th>Position</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {organizers.filter(org => {
                  const status = org.organizer.verified || 'Pending';
                  return statusFilter === 'All' || status === statusFilter;
                }).length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                      No Organizers found
                    </td>
                  </tr>
                ) : (
                  organizers
                    .filter(org => {
                      const status = org.organizer.verified || 'Pending';
                      return statusFilter === 'All' || status === statusFilter;
                    })
                    .map((organizer) => (
                      <tr key={organizer.id}>
                        <td data-label="ID">{organizer.id}</td>
                        <td data-label="Email">{organizer.email || 'N/A'}</td>
                        <td data-label="Name">{organizer.name || 'N/A'}</td>
                        <td data-label="Phone">{organizer.phoneNumber || 'N/A'}</td>
                        <td data-label="Company">{organizer.organizer.companyName || 'N/A'}</td>
                        <td data-label="Address">{organizer.organizer.address || 'N/A'}</td>
                        <td data-label="Position">{organizer.organizer.position || 'N/A'}</td>
                        <td data-label="Status">
                          <span className={`status-tag ${organizer.organizer.verified ? organizer.organizer.verified.toLowerCase() : 'pending'}`}>
                            {organizer.organizer.verified || 'Pending'}
                          </span>
                        </td>
                        <td data-label="Action">
                          <button
                            type="button"
                            className="action-btn edit-btn"
                            onClick={() => handleValidation(organizer.id, organizer.verified || 'Pending',
                              organizer.email,
                              organizer.name,
                            )}
                          >
                            Validate
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

    </div>
  );
}