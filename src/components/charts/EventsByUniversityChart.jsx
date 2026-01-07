import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EventsByUniversityChart({ eventsData, universities }) {
  // Count events by university
  const universityCounts = {};
  
  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Events by University</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No events data available</p>
        </div>
      </div>
    );
  }

  eventsData.forEach(event => {
    const universityId = event.universityId;
    if (universityId) {
      const university = universities?.find(uni => uni.id === universityId);
      const universityName = university ? university.universityName : 'Other';
      universityCounts[universityName] = (universityCounts[universityName] || 0) + 1;
    }
  });

  const sortedUniversities = Object.entries(universityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 universities

  if (sortedUniversities.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Events by University</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No university data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: sortedUniversities.map(([name]) => name),
    datasets: [
      {
        label: 'Number of Events',
        data: sortedUniversities.map(([, count]) => count),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Events: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Top Universities by Events</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

