import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function EventsOverTimeChart({ eventsData }) {
  // Group events by specific date (daily)
  const dailyData = {};
  
  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Events Created Over Time</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No events data available</p>
        </div>
      </div>
    );
  }

  eventsData.forEach(event => {
    if (event.createdAt) {
      try {
        const date = event.createdAt.toDate ? event.createdAt.toDate() : new Date(event.createdAt);
        if (!isNaN(date.getTime())) {
          const dateKey = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          
          if (!dailyData[dateKey]) {
            dailyData[dateKey] = 0;
          }
          dailyData[dateKey]++;
        }
      } catch (error) {
        console.error('Error processing event date:', error);
      }
    }
  });

  const sorted = Object.entries(dailyData)
    .map(([label, count]) => {
      const d = new Date(label);
      return { label, count, date: d };
    })
    .sort((a, b) => a.date - b.date);

  const data = {
    labels: sorted.map((item) => item.label),
    datasets: [
      {
        label: 'Events Created',
        data: sorted.map((item) => item.count),
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
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
      <h3 className="chart-title">Events Created Over Time</h3>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

