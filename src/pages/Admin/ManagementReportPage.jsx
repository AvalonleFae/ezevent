import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import KPICards from '../../components/charts/KPICards';
import UserRoleChart from '../../components/charts/UserRoleChart';
import EventStatusChart from '../../components/charts/EventStatusChart';
import EventsOverTimeChart from '../../components/charts/EventsOverTimeChart';
import EventsByCategoryChart from '../../components/charts/EventsByCategoryChart';
import EventsByUniversityChart from '../../components/charts/EventsByUniversityChart';
import TopEventsChart from '../../components/charts/TopEventsChart';
import OrganizerStatusChart from '../../components/charts/OrganizerStatusChart';
import TransactionsDoneChart from '../../components/charts/TransactionsDoneChart';
import ParticipantsByUniversityChart from '../../components/charts/ParticipantsByUniversityChart';
import '../../css/ManagementReportPage.css';

export default function ManagementReportPage() {
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (date) => {
    setStartDate(date);
    // If endDate is before the new startDate, clear it
    if (endDate && date && new Date(endDate) < new Date(date)) {
      setEndDate('');
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    pendingValidations: 0,
    pendingEventValidations: 0,
    totalParticipants: 0,
    totalOrganizers: 0
  });
  const [userStats, setUserStats] = useState({
    participants: 0,
    organizers: 0,
    admins: 0
  });
  const [eventStats, setEventStats] = useState({
    accepted: 0,
    pending: 0,
    declined: 0
  });
  const [organizerStats, setOrganizerStats] = useState({
    accepted: 0,
    pending: 0,
    declined: 0
  });
  const [eventsData, setEventsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const participants = users.filter(u => u.role === 'participant').length;
        const organizers = users.filter(u => u.role === 'organizer').length;
        const admins = users.filter(u => u.role === 'admin').length;

        setUserStats({ participants, organizers, admins });

        setParticipants(users.filter(u => u.role === 'participant'));

        // Fetch organizer verification status
        const organizerUsers = users.filter(u => u.role === 'organizer');
        const organizerStatusCounts = {
          accepted: 0,
          pending: 0,
          declined: 0
        };

        organizerUsers.forEach(org => {
          const verified = org.organizer?.verified || 'Pending';
          if (verified === 'Accepted') organizerStatusCounts.accepted++;
          else if (verified === 'Declined') organizerStatusCounts.declined++;
          else organizerStatusCounts.pending++;
        });

        setOrganizerStats(organizerStatusCounts);
        // Calculate total users excluding admins
        const totalUsersExcludingAdmins = participants + organizers;
        setMetrics(prev => ({
          ...prev,
          totalUsers: totalUsersExcludingAdmins,
          totalParticipants: participants,
          totalOrganizers: organizers,
          pendingValidations: organizerStatusCounts.pending
        }));

        // Fetch events
        const eventsSnapshot = await getDocs(collection(db, 'events'));
        const events = eventsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setEventsData(events);

        const eventStatusCounts = {
          accepted: events.filter(e => e.status === 'Accepted').length,
          pending: events.filter(e => e.status === 'pending' || e.status === 'Pending').length,
          declined: events.filter(e => e.status === 'Declined').length
        };

        setEventStats(eventStatusCounts);
        setMetrics(prev => ({
          ...prev,
          totalEvents: events.length,
          pendingEventValidations: eventStatusCounts.pending
        }));

        // Fetch registrations
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const registrations = registrationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRegistrations(registrations);

        setMetrics(prev => ({
          ...prev,
          totalRegistrations: registrations.length
        }));

        // Calculate top events by registrations (only accepted events with registrations)
        const eventRegistrationCounts = {};
        registrations.forEach(reg => {
          const eventId = reg.eventId;
          eventRegistrationCounts[eventId] = (eventRegistrationCounts[eventId] || 0) + 1;
        });

        const topEventsList = events
          .filter(event => event.status === 'Accepted') // Only show accepted events
          .map(event => ({
            ...event,
            registrationCount: eventRegistrationCounts[event.id] || 0
          }))
          .filter(event => event.registrationCount > 0) // Only show events with registrations
          .sort((a, b) => b.registrationCount - a.registrationCount)
          .slice(0, 5); // Top 5 events

        setTopEvents(topEventsList);

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'eventCategories'));
        const categoriesList = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCategories(categoriesList);

        // Fetch universities
        const universitiesSnapshot = await getDocs(collection(db, 'universities'));
        const universitiesList = universitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUniversities(universitiesList);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="management-report-content">
        <div className="loading-container">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const filteredRegistrations = registrations.filter(reg => {
    if (!reg.registeredAt) return false;

    try {
      const date = reg.registeredAt.toDate
        ? reg.registeredAt.toDate()
        : new Date(reg.registeredAt);

      if (startDate) {
        const from = new Date(startDate);
        if (date < from) return false;
      }

      if (endDate) {
        const to = new Date(endDate + 'T23:59:59');
        if (date > to) return false;
      }

      return true;
    } catch (err) {
      console.error('Error filtering registrations by date:', err);
      return false;
    }
  });



  return (
    <div className="management-report-content"> 
      <div className="management-report-header-row">
        <h1>EZEvent Management Report</h1>
      </div>

      <div className="dashboard-container">
        {/* Date Range Filter */}
        <section className="dashboard-section">
          <div className="date-range-filter-section">
            <div className="date-range-controls">
              <label>
                From
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
              </label>
              <label>
                To
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  min={startDate || undefined}
                />
              </label>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                Clear
              </button>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="dashboard-section">
          <KPICards metrics={metrics} />
        </section>

        
        

        {/* Charts Grid */}
        <section className="dashboard-section">
          <div className="charts-grid">
            {/* Row 1: User and Event Status Charts */}
            <div className="chart-card">
              <UserRoleChart userStats={userStats} />
            </div>
            <div className="chart-card">
              <OrganizerStatusChart organizerStats={organizerStats} />
            </div>
            <div className="chart-card">
              <EventStatusChart eventStats={eventStats} />
            </div>
          </div>
        </section>

        {/* Row 2: Time Series Charts */}
        <section className="dashboard-section">
          <div className="charts-grid full-width">
            <div className="chart-card full-width">
              <EventsOverTimeChart eventsData={eventsData} />
            </div>
          </div>
        </section>

        {/* Row 3: Transactions Done */}
        <section className="dashboard-section">
          <div className="charts-grid full-width">
            <div className="chart-card full-width">
              <TransactionsDoneChart registrations={filteredRegistrations} />
            </div>
          </div>
        </section>

        {/* Row 4: Category and University Charts */}
        <section className="dashboard-section">
          <div className="charts-grid">
            <div className="chart-card">
              <EventsByCategoryChart eventsData={eventsData} categories={categories} />
            </div>
            <div className="chart-card">
              <ParticipantsByUniversityChart participantsData={participants} universities={universities} />
            </div>
            <div className="chart-card">
              <EventsByUniversityChart eventsData={eventsData} universities={universities} />
            </div>
          </div>
        </section>

        {/* Row 5: Top Events */}
        <section className="dashboard-section">
          <div className="charts-grid full-width">
            <div className="chart-card full-width">
              <TopEventsChart topEvents={topEvents} />
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}

