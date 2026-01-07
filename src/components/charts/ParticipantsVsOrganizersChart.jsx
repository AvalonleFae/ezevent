import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ParticipantsVsOrganizersChart({ userStats }) {
  const { participants, organizers } = userStats;

  if ((participants === 0 && organizers === 0)) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Participants vs Organizers</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: ['Participants', 'Organizers'],
    datasets: [
      {
        label: 'Users by Type',
        data: [participants || 0, organizers || 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">Participants vs Organizers</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

