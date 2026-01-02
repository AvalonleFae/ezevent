import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import KPICards from '../../components/charts/KPICards';
import UserRoleChart from '../../components/charts/UserRoleChart';
import EventStatusChart from '../../components/charts/EventStatusChart';
import EventsOverTimeChart from '../../components/charts/EventsOverTimeChart';
import RegistrationsOverTimeChart from '../../components/charts/RegistrationsOverTimeChart';
import EventsByCategoryChart from '../../components/charts/EventsByCategoryChart';
import EventsByUniversityChart from '../../components/charts/EventsByUniversityChart';
import TopEventsChart from '../../components/charts/TopEventsChart';
import OrganizerStatusChart from '../../components/charts/OrganizerStatusChart';
import ParticipantsByUniversityChart from '../../components/charts/ParticipantsByUniversityChart';
import GenderDemographicsChart from '../../components/charts/GenderDemographicsChart';
import ParticipantsVsOrganizersChart from '../../components/charts/ParticipantsVsOrganizersChart';
import '../../css/ManagementReportPage.css';

export default function ManagementReportPage() {
  const [loading, setLoading] = useState(true);
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
  const [registrationsData, setRegistrationsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [topEvents, setTopEvents] = useState([]);
  const [participantsData, setParticipantsData] = useState([]);

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

        // Store participants data for university chart
        const participantsList = users.filter(u => u.role === 'participant');
        setParticipantsData(participantsList);

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

        setRegistrationsData(registrations);
        setMetrics(prev => ({
          ...prev,
          totalRegistrations: registrations.length
        }));

        // Calculate top events by registrations
        const eventRegistrationCounts = {};
        registrations.forEach(reg => {
          const eventId = reg.eventId;
          eventRegistrationCounts[eventId] = (eventRegistrationCounts[eventId] || 0) + 1;
        });

        const topEventsList = events
          .map(event => ({
            ...event,
            registrationCount: eventRegistrationCounts[event.id] || 0
          }))
          .sort((a, b) => b.registrationCount - a.registrationCount)
          .slice(0, 10);

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
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="management-report-content">
      <h1>Management Dashboard</h1>
      
      <div className="dashboard-container">
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
              <ParticipantsVsOrganizersChart userStats={userStats} />
            </div>
            <div className="chart-card">
              <EventStatusChart eventStats={eventStats} />
            </div>
            <div className="chart-card">
              <OrganizerStatusChart organizerStats={organizerStats} />
            </div>
            <div className="chart-card">
              <GenderDemographicsChart participantsData={participantsData} />
            </div>
            <div className="chart-card">
              <ParticipantsByUniversityChart participantsData={participantsData} universities={universities} />
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


        {/* Row 3: Category and University Charts */}
        <section className="dashboard-section">
          <div className="charts-grid two-column">
            <div className="chart-card">
              <EventsByCategoryChart eventsData={eventsData} categories={categories} />
            </div>
            <div className="chart-card">
              <EventsByUniversityChart eventsData={eventsData} universities={universities} />
            </div>
          </div>
        </section>

        {/* Row 4: Top Events */}
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

