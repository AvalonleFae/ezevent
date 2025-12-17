import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import DataTable, { createTheme } from 'react-data-table-component';
import { useLocation } from 'react-router-dom';
import '../../css/AttendanceList.css';

const AttendanceList = () => {
    const { id } = useParams();   // eventId from route
    const navigate = useNavigate();
    const [attendees, setAttendees] = useState([]);
    const [filterText, setFilterText] = useState('');
    const location = useLocation();
    const eventName = location.state?.eventName || 'event';

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const regQuery = query(collection(db, 'registrations'), where('eventId', '==', id));
                const regSnap = await getDocs(regQuery);

                const attendeeData = await Promise.all(
                    regSnap.docs.map(async (regDoc) => {
                        const regId = regDoc.id;
                        const { userId, userEmail } = regDoc.data();


                        // Get user name
                        const userRef = doc(db, 'users', userId);
                        const userSnap = await getDoc(userRef);
                        const name = userSnap.exists() ? userSnap.data().name : 'Unknown';
                        const phoneNumber = userSnap.exists() ? userSnap.data().phoneNumber : 'Unknown';

                        // Get attendance status from subcollection
                        const attendanceSub = collection(db, 'registrations', regId, 'attendance');
                        const attendanceSnap = await getDocs(attendanceSub);

                        let status = 'unknown';
                        attendanceSnap.forEach((doc) => {
                            const data = doc.data();
                            if (data.eventId === id && data.status) {
                                status = data.status;
                            }
                        });

                        return { name, email: userEmail, absence: status === 'absent', phoneNumber };
                    })
                );

                setAttendees(attendeeData);
            } catch (err) {
                console.error('Error fetching attendance:', err);
            }
        };

        fetchAttendance();
    }, [id]);

    // DataTable columns
    const columns = [
        { name: 'Name', selector: row => row.name, sortable: true },
        { name: 'Email', selector: row => row.email, sortable: true },
        { name: 'Absent', selector: row => (row.absence ? 'Yes' : 'No'), sortable: true },
        { name: 'Phone Number', selector: row => row.phoneNumber, sortable: true },
    ];

    // Filter attendees by name
    const filteredAttendees = attendees.filter(att =>
        att.name && att.name.toLowerCase().includes(filterText.toLowerCase())
    );

    // Custom search input
    const subHeaderComponent = (
        <div className="subheader-container">
            <input
                type="text"
                placeholder="Search by name..."
                className="search-input"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
            />
            <button className="action-button-CSV" onClick={exportToCSV}>
                Export CSV
            </button>
        </div>
    );

    // CSV Export Function
    const safeEventName = eventName.replace(/\s+/g, '_'); // sanitize filename (replace spaces with underscores)

    function exportToCSV() {
        if (!filteredAttendees.length) return;

        const headers = ['Name', 'Email', 'Absent', 'Phone Number'];
        const rows = filteredAttendees.map(a => [
            a.name,
            a.email,
            a.absence ? 'Yes' : 'No',
            a.phoneNumber,
        ]);

        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `attendance_${safeEventName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="attendance-container">
            <h2>Attendance List for {eventName}</h2>

            {/* Back Button */}
            <button
                className="action-button-brown"
                onClick={() => navigate(`/organizer/my-event/${id}/dashboard`)}
            >
                ← Back to Dashboard
            </button>

            <DataTable
                columns={columns}
                data={filteredAttendees}
                pagination
                highlightOnHover
                striped
                responsive
                subHeader
                subHeaderComponent={subHeaderComponent}
                theme="brownTheme"
            />
        </div>
    );
};

createTheme('brownTheme', {
    text: {
        primary: '#3e2723',
        secondary: '#6d4c41',
    },
    background: {
        default: '#fff8f0',
    },
    context: {
        background: '#8B5E3C',
        text: '#FFFFFF',
    },
    divider: {
        default: '#d7ccc8',
    },
    highlightOnHover: {
        default: '#fbe9e7',
        text: '#3e2723',
    },
    striped: {
        default: '#f3e5f5',
        text: '#3e2723',
    },
});

export default AttendanceList;