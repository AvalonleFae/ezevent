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

export default function RegistrationsOverTimeChart({ registrationsData }) {
  // Group registrations by month
  const monthlyData = {};
  
  if (!registrationsData || registrationsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Registrations Over Time</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No registrations data available</p>
        </div>
      </div>
    );
  }

  registrationsData.forEach(reg => {
    if (reg.createdAt) {
      try {
        const date = reg.createdAt.toDate ? reg.createdAt.toDate() : new Date(reg.createdAt);
        if (!isNaN(date.getTime())) {
          const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = 0;
          }
          monthlyData[monthKey]++;
        }
      } catch (error) {
        console.error('Error processing registration date:', error);
      }
    }
  });

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    try {
      return new Date(a) - new Date(b);
    } catch {
      return 0;
    }
  });

  const data = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Registrations',
        data: sortedMonths.map(month => monthlyData[month]),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
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
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Registrations Over Time</h3>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

