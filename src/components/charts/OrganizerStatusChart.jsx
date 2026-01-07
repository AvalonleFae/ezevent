import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OrganizerStatusChart({ organizerStats }) {
  const data = {
    labels: ['Accepted', 'Pending', 'Declined'],
    datasets: [
      {
        label: 'Organizer Verification Status',
        data: [
          organizerStats.accepted || 0,
          organizerStats.pending || 0,
          organizerStats.declined || 0
        ],
        backgroundColor: [
          'rgba(76, 175, 80, 0.6)',
          'rgba(255, 152, 0, 0.6)',
          'rgba(244, 67, 54, 0.6)'
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(255, 152, 0, 1)',
          'rgba(244, 67, 54, 1)'
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
      <h3 className="chart-title">Organizer Verification Status</h3>
      <div className="chart-wrapper">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}

