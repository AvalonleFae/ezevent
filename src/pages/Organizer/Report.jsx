import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
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
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);


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

                const salesLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                const salesValues = Array(12).fill(0);
                salesValues[eventMonth] = totalSalesAmount;

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

                // Fetch Reviews
                const reviewSnap = await getDocs(collection(db, 'events', id, 'review'));
                const reviewList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(reviewList);

                if (reviewList.length > 0) {
                    const totalRating = reviewList.reduce((acc, rev) => acc + (rev.rating || 0), 0);
                    setAvgRating((totalRating / reviewList.length).toFixed(1));
                }

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
                                    legend: { labels: { color: '#FFF', font: { family: 'Bebas Neue' } } }
                                },
                                scales: {
                                    y: { ticks: { color: '#FFF' }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                    x: { ticks: { color: '#FFF' }, grid: { display: false } }
                                },
                            }}
                        />
                    ) : (
                        <p>Loading sales chart...</p>
                    )}
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
                                        y: { beginAtZero: true, ticks: { color: '#FFF', precision: 0 }, grid: { color: 'rgba(255,255,255,0.1)' } },
                                        x: { ticks: { color: '#FFF' }, grid: { display: false } }
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
                                    plugins: { legend: { position: 'bottom', labels: { color: '#FFF' } } }
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
                                    plugins: { legend: { position: 'bottom', labels: { color: '#FFF' } } }
                                }}
                            />
                        ) : (
                            <p>Loading institution chart...</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Section */}
            <div className="tbhx-card reviews-section-tbhx">
                <div className="reviews-header-tbhx">
                    <h3 className="tbhx-header">Participant Feedback</h3>
                    <div className="avg-rating-badge">
                        <span className="rating-val">{avgRating}</span>
                        <span className="rating-star">★</span>
                        <span className="rating-count">({reviews.length} reviews)</span>
                    </div>
                </div>

                <div className="reviews-list-tbhx">
                    {reviews.length > 0 ? (
                        reviews.map((rev) => (
                            <div key={rev.id} className="review-item-tbhx">
                                <div className="review-item-header">
                                    <span className="reviewer-name">{rev.userName || "Anonymous"}</span>
                                    <div className="reviewer-rating">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`mini-star ${i < rev.rating ? 'filled' : ''}`}>★</span>
                                        ))}
                                    </div>
                                </div>
                                <p className="review-message">"{rev.message}"</p>
                                <div className="review-meta">
                                    <span>Recommend: {rev.recommend}</span> | <span>Objective Achieved: {rev.objective}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">No reviews submitted yet for this event.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportPage;
