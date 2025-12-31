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
        { name: 'NAME', selector: row => row.name, sortable: true },
        { name: 'EMAIL', selector: row => row.email, sortable: true },
        { name: 'ABSENT', selector: row => (row.absence ? 'YES' : 'NO'), sortable: true },
        { name: 'PHONE NUMBER', selector: row => row.phoneNumber, sortable: true },
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
                placeholder="SEARCH BY NAME..."
                className="search-input"
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
            />
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
            <div className="halftone-bg"></div>
            <h2 className="tbhx-header">ATTENDANCE <span className="text-glow">LOG</span></h2>

            {/* Back Button */}
            <button
                className="tbhx-button action-button-brown"
                onClick={() => navigate(`/organizer/my-event/${id}/dashboard`)}
            >
                &larr; BACK
            </button>

            <DataTable
                columns={columns}
                data={filteredAttendees}
                pagination
                responsive
                subHeader
                subHeaderComponent={subHeaderComponent}
                theme="tbhxTheme"
            />
            <button className="action-button-CSV" onClick={exportToCSV}>
                EXPORT CSV
            </button>
        </div>
    );
};

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

export default AttendanceList;