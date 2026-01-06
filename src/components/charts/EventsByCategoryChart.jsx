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

export default function EventsByCategoryChart({ eventsData, categories }) {
  // Count events by category
  const categoryCounts = {};
  
  if (!eventsData || eventsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Events by Category</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No events data available</p>
        </div>
      </div>
    );
  }

  eventsData.forEach(event => {
    const categoryId = event.categoryId;
    if (categoryId) {
      const category = categories?.find(cat => cat.id === categoryId);
      const categoryName = category ? category.categoryName : 'Unknown';
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    }
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10 categories

  if (sortedCategories.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Events by Category</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No category data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: sortedCategories.map(([name]) => name),
    datasets: [
      {
        label: 'Number of Events',
        data: sortedCategories.map(([, count]) => count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
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
      <h3 className="chart-title">Top Categories</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

