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

export default function TransactionsDoneChart({ registrations }) {
  if (!registrations || registrations.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Transactions Done</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>
            No transaction data available
          </p>
        </div>
      </div>
    );
  }

  const dailyCounts = {};

  registrations.forEach((reg) => {
    if (reg.registeredAt) {
      try {
        const date = reg.registeredAt.toDate
          ? reg.registeredAt.toDate()
          : new Date(reg.registeredAt);

        if (!isNaN(date.getTime())) {
          const key = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          dailyCounts[key] = (dailyCounts[key] || 0) + 1;
        }
      } catch (err) {
        console.error('Error processing registration date for transactions chart:', err);
      }
    }
  });

  const sorted = Object.entries(dailyCounts)
    .map(([label, count]) => {
      const d = new Date(label);
      return { label, count, date: d };
    })
    .sort((a, b) => a.date - b.date);

  const data = {
    labels: sorted.map((item) => item.label),
    datasets: [
      {
        label: 'Transactions',
        data: sorted.map((item) => item.count),
        borderColor: 'rgba(255, 64, 64, 1)',
        backgroundColor: 'rgba(255, 64, 64, 0.1)',
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
      <h3 className="chart-title">Transactions Done</h3>
      <div className="chart-wrapper">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}


