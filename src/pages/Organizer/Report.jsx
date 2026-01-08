import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
} from 'chart.js';
import { doc, collection, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams, useNavigate } from 'react-router-dom';
import '../../css/Report.css';

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const ReportPage = () => {
    const { id } = useParams(); // eventId
    const navigate = useNavigate();
    const [ageData, setAgeData] = useState({ labels: [], datasets: [] });
    const [genderData, setGenderData] = useState({ labels: [], datasets: [] });
    const [institutionData, setInstitutionData] = useState({ labels: [], datasets: [] });
    const [salesData, setSalesData] = useState({ labels: [], datasets: [] });
    const [totalSales, setTotalSales] = useState(0);
    const [attendanceData, setAttendanceData] = useState({ labels: [], datasets: [] });
    const [registrationTimelineData, setRegistrationTimelineData] = useState({ labels: [], datasets: [] });
    const [checkInTimeData, setCheckInTimeData] = useState({ labels: [], datasets: [] });
    const [paymentMethodData, setPaymentMethodData] = useState({ labels: [], datasets: [] });


    useEffect(() => {
        const fetchReportData = async () => {
            try {
                //fetch event details
                const eventDoc = await getDoc(doc(db, 'events', id));
                if (!eventDoc.exists()) throw new Error('Event not found');

                const eventData = eventDoc.data();
                const eventDate = eventData.date.toDate();
                const eventMonth = eventDate.getMonth();
                const eventPrice = parseFloat(eventData.price || '0');

                const regQuery = query(collection(db, 'registrations'), where('eventId', '==', id));
                const regSnap = await getDocs(regQuery);

                const totalParticipants = regSnap.size;
                const totalSalesAmount = totalParticipants * eventPrice;
                setTotalSales(totalSalesAmount);

                // Fetch attendance data
                let presentCount = 0;
                let absentCount = 0;
                const checkInTimes = [];
                const registrationDates = [];
                const paymentMethods = { 'Stripe Card': 0 };

                // Process each registration to get attendance and other data
                const attendancePromises = regSnap.docs.map(async (regDoc) => {
                    const regData = regDoc.data();

                    // Get registration date
                    if (regData.registeredAt) {
                        const regDate = regData.registeredAt.toDate ? regData.registeredAt.toDate() : new Date(regData.registeredAt);
                        registrationDates.push(regDate);
                    }

                    // Get payment method (all seem to be Stripe based on codebase)
                    if (regData.paymentId) {
                        paymentMethods['Stripe Card']++;
                    }

                    // Get attendance status
                    const attendanceSub = collection(db, 'registrations', regDoc.id, 'attendance');
                    const attendanceSnap = await getDocs(attendanceSub);

                    let isPresent = false;
                    attendanceSnap.docs.forEach(attDoc => {
                        const attData = attDoc.data();
                        if (attData.status === 'present') {
                            isPresent = true;
                            if (attData.checkInTime) {
                                const checkInTime = attData.checkInTime.toDate ? attData.checkInTime.toDate() : new Date(attData.checkInTime);
                                checkInTimes.push(checkInTime);
                            }
                        }
                    });

                    if (isPresent) {
                        presentCount++;
                    } else {
                        absentCount++;
                    }
                });

                await Promise.all(attendancePromises);


                let ages = {
                    'Under 20': 0,
                    '20-29': 0,
                    '30-39': 0,
                    '40-49': 0,
                    '50+': 0
                };
                let genders = {
                    'Male': 0,
                    'Female': 0,
                };
                let institutions = {
                    'UKM': 0,
                    'UPM': 0,
                    'UTM': 0,
                    'UM': 0,
                };

                const userIds = regSnap.docs.map(doc => doc.data().userId);
                const userPromises = userIds
                    .filter(uid => uid)
                    .map(uid => getDoc(doc(db, 'users', uid)));
                const userSnapshots = await Promise.all(userPromises);

                userSnapshots.forEach(docSnap => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        const { age, gender, participant } = userData;
                        const institution = participant?.institution || 'Unknown';

                        // Age distribution
                        const ageNum = parseInt(age);
                        if (!isNaN(ageNum)) {
                            let ageGroup = 'Unknown';
                            if (ageNum < 20) ageGroup = 'Under 20';
                            else if (ageNum < 30) ageGroup = '20-29';
                            else if (ageNum < 40) ageGroup = '30-39';
                            else if (ageNum < 50) ageGroup = '40-49';
                            else ageGroup = '50+';

                            if (ages[ageGroup] !== undefined) {
                                ages[ageGroup]++;
                            }
                        }

                        // Gender distribution
                        genders[gender || 'Unknown'] = (genders[gender || 'Unknown'] || 0) + 1;

                        // Institution distribution
                        institutions[institution || 'Unknown'] = (institutions[institution || 'Unknown'] || 0) + 1;
                    }
                });

                const ageLabels = ['Under 20', '20-29', '30-39', '40-49', '50+'];
                const ageValues = ageLabels.map(label => ages[label]);

                setAgeData({
                    labels: ageLabels,
                    datasets: [
                        {
                            label: 'Participants by Age',
                            data: ageValues,
                            backgroundColor: '#FF4040',
                            borderColor: '#FFFFFF',
                            borderWidth: 1,
                        },
                    ],
                });

                const genderLabels = ['Female', 'Male'];
                const genderValues = genderLabels.map(label => genders[label]);

                setGenderData({
                    labels: genderLabels,
                    datasets: [
                        {
                            label: 'Gender',
                            data: genderValues,
                            backgroundColor: ['#FF4040', '#00F0FF'],
                            borderColor: '#000000',
                            borderWidth: 2,
                        },
                    ],
                });

                const InsLabels = ['UKM', 'UPM', 'UTM', 'UM'];
                const InsValues = InsLabels.map(label => institutions[label]);

                setInstitutionData({
                    labels: InsLabels,
                    datasets: [
                        {
                            label: 'Institution',
                            data: InsValues,
                            backgroundColor: ['#FF4040', '#00F0FF', '#FFFFFF', '#444444'],
                            borderColor: '#000000',
                            borderWidth: 2,
                        },
                    ],
                });

                // Sales Performance - Daily sales based on registration dates
                const salesMap = {};
                regSnap.docs.forEach(regDoc => {
                    const regData = regDoc.data();
                    if (regData.registeredAt) {
                        const regDate = regData.registeredAt.toDate ? regData.registeredAt.toDate() : new Date(regData.registeredAt);
                        // Format: Jan 1, 2026
                        const dateKey = regDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        salesMap[dateKey] = (salesMap[dateKey] || 0) + eventPrice;
                    }
                });

                // Sort by date
                const sortedSales = Object.entries(salesMap)
                    .map(([dateStr, amount]) => {
                        // Parse the date string to get a proper date for sorting
                        // dateStr format: 'Jan 1, 2026'
                        const [month, dayWithComma, year] = dateStr.split(' ');
                        const day = parseInt(dayWithComma.replace(',', ''));
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                        const monthIndex = monthNames.indexOf(month);
                        const date = new Date(parseInt(year), monthIndex, day);
                        return { dateStr, amount, date };
                    })
                    .sort((a, b) => a.date - b.date);

                const salesLabels = sortedSales.map(item => item.dateStr);
                const salesValues = sortedSales.map(item => item.amount);

                // If no registrations yet, show empty chart
                if (salesLabels.length === 0) {
                    salesLabels.push('No Sales');
                    salesValues.push(0);
                }

                setSalesData({
                    labels: salesLabels,
                    datasets: [
                        {
                            label: 'Ticket Sales (RM)',
                            data: salesValues,
                            backgroundColor: 'rgba(0, 240, 255, 0.2)',
                            borderColor: '#00F0FF',
                            pointBackgroundColor: '#FF4040',
                            fill: true,
                            tension: 0.4,
                        },
                    ],
                });

                // Attendance Rate Chart (Present vs Absent)
                setAttendanceData({
                    labels: ['Present', 'Absent'],
                    datasets: [
                        {
                            label: 'Attendance',
                            data: [presentCount, absentCount],
                            backgroundColor: ['#50C878', '#FF4040'],
                            borderColor: '#FFFFFF',
                            borderWidth: 2,
                        },
                    ],
                });


                // Check-in Time Distribution (Hourly)
                const hourlyCheckIns = Array(24).fill(0);
                checkInTimes.forEach(time => {
                    const hour = time.getHours();
                    hourlyCheckIns[hour]++;
                });

                const hourLabels = Array.from({ length: 24 }, (_, i) => {
                    const hour = i % 12 || 12;
                    const period = i < 12 ? 'AM' : 'PM';
                    return `${hour}:00 ${period}`;
                });

                setCheckInTimeData({
                    labels: hourLabels,
                    datasets: [
                        {
                            label: 'Check-ins',
                            data: hourlyCheckIns,
                            backgroundColor: '#00F0FF',
                            borderColor: '#FFFFFF',
                            borderWidth: 1,
                        },
                    ],
                });


            } catch (err) {
                console.error('Error fetching report data:', err);
            }
        };

        fetchReportData();
    }, [id]);

    return (
        <div className="report-container-tbhx">
            <header className="report-header-tbhx">
                <h2 className="tbhx-header">Event <span className="text-glow-org">Insights</span></h2>
                <button className="tbhx-button back-btn" onClick={() => navigate(-1)}>
                    &larr; BACK
                </button>
            </header>

            {/* Summary Statistics */}
            <div className="report-summary-row">
                <div className="tbhx-card summary-card">
                    <span className="stat-label">Total Registered</span>
                    <span className="stat-value">{Object.values(ageData.datasets[0]?.data || []).reduce((a, b) => a + b, 0)}</span>
                </div>

                <div className="tbhx-card summary-card highlighted">
                    <span className="stat-label">Total Sales</span>
                    <span className="stat-value">RM {totalSales}</span>
                </div>
            </div>

            <div className="tbhx-card sales-chart-section chart-section">
                <h3 className="tbhx-header">Sales Performance</h3>
                <div className="sales-chart-wrapper">
                    {salesData.labels.length > 0 ? (
                        <Line
                            data={salesData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { labels: { color: '#000000ff', font: { family: 'Roboto' } } }
                                },
                                scales: {
                                    y: { ticks: { color: '#000000ff' }, grid: { color: 'rgba(255, 255, 255, 0.04)' } },
                                    x: { ticks: { color: '#000000ff' }, grid: { display: false } }
                                },
                            }}
                        />
                    ) : (
                        <p>Loading sales chart...</p>
                    )}
                </div>
            </div>

            {/* New Charts Section */}
            <div className="report-charts-grid">
                <div className="tbhx-card chart-section">
                    <h3 className="tbhx-header">Attendance Rate</h3>
                    <div className="chart-wrapper">
                        {attendanceData.labels.length > 0 ? (
                            <Doughnut
                                data={attendanceData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { position: 'bottom', labels: { color: '#000000ff', font: { family: 'Roboto', size: 15 } } },
                                        tooltip: {
                                            callbacks: {
                                                label: function (context) {
                                                    const label = context.label || '';
                                                    const value = context.parsed || 0;
                                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                                    return `${label}: ${value} (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        ) : (
                            <p>Loading attendance chart...</p>
                        )}
                    </div>
                </div>


                <div className="tbhx-card chart-section">
                    <h3 className="tbhx-header">Check-in Time Distribution</h3>
                    <div className="chart-wrapper">
                        {checkInTimeData.labels.length > 0 ? (
                            <Bar
                                data={checkInTimeData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false }
                                    },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { color: '#000000ff', precision: 0 }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                        x: { ticks: { color: '#000000ff', maxRotation: 90, minRotation: 90, font: { size: 10 } }, grid: { display: false } }
                                    }
                                }}
                            />
                        ) : (
                            <p>Loading check-in time chart...</p>
                        )}
                    </div>
                </div>

            </div>

            <div className="report-charts-grid">
                <div className="tbhx-card chart-section">
                    <h3 className="tbhx-header">Age Groups</h3>
                    <div className="chart-wrapper">
                        {ageData.labels.length > 0 ? (
                            <Bar
                                data={ageData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: {
                                        y: { beginAtZero: true, ticks: { color: '#000000ff', precision: 0 }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                        x: { ticks: { color: '#000000ff' }, grid: { display: false } }
                                    }
                                }}
                            />
                        ) : (
                            <p>Loading age chart...</p>
                        )}
                    </div>
                </div>

                <div className="tbhx-card chart-section">
                    <h3 className="tbhx-header">Gender</h3>
                    <div className="chart-wrapper">
                        {genderData.labels.length > 0 ? (
                            <Pie
                                data={genderData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { color: '#000000ff' } } }
                                }}
                            />
                        ) : (
                            <p>Loading gender chart...</p>
                        )}
                    </div>
                </div>

                <div className="tbhx-card chart-section">
                    <h3 className="tbhx-header">Institutions</h3>
                    <div className="chart-wrapper">
                        {institutionData.labels.length > 0 ? (
                            <Pie
                                data={institutionData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { position: 'bottom', labels: { color: '#000000ff' } } }
                                }}
                            />
                        ) : (
                            <p>Loading institution chart...</p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ReportPage;