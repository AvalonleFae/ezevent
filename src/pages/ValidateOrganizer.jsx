import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, query, where, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import "../css/ValidateOrganizer.css";

export default function ValidateOrganizer() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

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


  

  const handleValidation = async (organizerId, currentStatus) => {
    const newStatus = prompt(`Current: ${currentStatus}. Type 'accept' or 'decline':`).toLowerCase();

    if (newStatus === 'accept' || newStatus === 'decline') {
      const statusToSet = newStatus === 'accept' ? 'Accepted' : 'Declined';
      try {
        const organizerRef = doc(db, 'users', organizerId);
        await updateDoc(organizerRef, {
          validationStatus: statusToSet,
          validationTimestamp: serverTimestamp()
        });

        setOrganizers(prev =>
          prev.map(org =>
            org.id === organizerId ? { ...org, validationStatus: statusToSet } : org
          )
        );
        alert(`Organizer ${statusToSet}.`);
      } catch (error) {
        console.error('Error:', error);
        alert('Failed to update status.');
      }
    }
  };

  return (
    // <div className="manage-organizers-container">

    //   {/* 1. Page Header outside the card */}
    //   <h2 className="page-title">Validate organizers</h2>

    //   {/* 2. The Card Container */}
    //   <div className="table-card">

    //     {/* 3. Card Title */}
    //     <div className="card-header">
    //         <h3>Organizers List</h3>
    //     </div>

    //     {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

    //     {loading ? (
    //       <p style={{textAlign: 'center'}}>Loading organizers...</p> 
    //     ) : (
    //       <table className="organizers-table">
    //         <thead>
    //           <tr>
    //             <th>ID</th>
    //             <th>Name</th>
    //             <th>Company</th>
    //             <th>Position</th>
    //             <th >Status</th>
    //             <th>Action</th>
    //           </tr>
    //         </thead>
    //         <tbody>
    //           {organizers.length === 0 ? (
    //             <tr>
    //               <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
    //                 No pending organizers found
    //               </td>
    //             </tr>
    //           ) : (
    //             organizers.map((organizer) => (
    //               <tr key={organizer.id}>
    //                 <td>{organizer.id.substring(0, 5)}...</td>
    //                 <td>
    //                     <strong>{organizer.name || 'N/A'}</strong><br/>
    //                     <span style={{fontSize: '0.85em', color: '#888'}}>{organizer.email}</span>
    //                 </td>
    //                 <td>{organizer.companyName || 'N/A'}</td>
    //                 <td>{organizer.position || 'N/A'}</td>
    //                 <td>
    //                   <span className={`status-tag ${organizer.validationStatus ? organizer.validationStatus.toLowerCase() : 'pending'}`}>
    //                     {organizer.validationStatus || 'Pending'}
    //                   </span>
    //                 </td>

    //                 <td>
    //                   <div className="action-buttons">
    //                     {/* Blue Button (View) */}
    //                     <button
    //                       className="btn btn-blue"
    //                       onClick={() => handleViewDetails(organizer.id)}
    //                     >
    //                       View Details
    //                     </button>

    //                     {/* Red Button (Validate/Delete style) */}
    //                     <button
    //                       className="btn btn-red"
    //                       onClick={() => handleValidation(organizer.id, organizer.validationStatus || 'Pending')}
    //                     >
    //                       Validate
    //                     </button>
    //                   </div>
    //                 </td>
    //               </tr>
    //             ))
    //           )}
    //         </tbody>
    //       </table>
    //     )}
    //   </div>

    //   {/* Simple Details Section (kept as is) */}
    //   {selectedOrganizer && (
    //     <div style={{marginTop: '20px', padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #ddd'}}>
    //       <h3>Details for {selectedOrganizer.name}</h3>
    //       <pre>{JSON.stringify(selectedOrganizer, null, 2)}</pre>
    //       <button className="btn btn-blue" onClick={() => setSelectedOrganizer(null)}>Close</button>
    //     </div>
    //   )}
    // </div>
    <div className="manage-organizer">
      <h1>Manage Organizers</h1>

      <section className="organizer-list-section">
        <h2>Organizers List</h2>
        {loading ? (
          <p>Loading Organizers...</p>
        ) : (
          <table className="organizer-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Email</th>
                <th>Name</th>
                <th>Company Name</th>
                <th>Company Address</th>
                <th>Position</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {organizers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                    No Organizers found
                  </td>
                </tr>
              ) : (
                organizers.map((organizer) => (
                  <tr key={organizer.id}>
                    <td>{organizer.id}</td>
                    <td>{organizer.email || 'N/A'}</td>
                    <td>{organizer.name || 'N/A'}</td>
                    <td>{organizer.organizer.companyName || 'N/A'}</td>
                    <td>{organizer.organizer.companyAddress || 'N/A'}</td>
                    <td>{organizer.organizer.position || 'N/A'}</td>
                    <td>
                      <span className={`status-tag ${organizer.validationStatus ? organizer.validationStatus.toLowerCase() : 'pending'}`}>
                         {organizer.validationStatus || 'Pending'}
                       </span>
                       </td>
                    <td>
                      <button 
                        type="button"
                        className="action-btn edit-btn"
                        onClick={() => handleValidation(organizer.id, organizer.validationStatus || 'Pending')}
                      >
                        Validate
                      </button>
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