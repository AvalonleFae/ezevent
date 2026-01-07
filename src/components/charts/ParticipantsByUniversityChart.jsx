import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ParticipantsByUniversityChart({ participantsData, universities }) {
  // Count participants by university/institution
  const universityCounts = {};
  
  if (!participantsData || participantsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Participants by University</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No participants data available</p>
        </div>
      </div>
    );
  }

  participantsData.forEach(participant => {
    const institution = participant.participant?.institution;
    if (institution) {
      // Try to match with university name from universities collection
      const matchedUniversity = universities?.find(uni => 
        uni.universityName?.toLowerCase() === institution.toLowerCase() ||
        institution.toLowerCase().includes(uni.universityName?.toLowerCase() || '')
      );
      
      const universityName = matchedUniversity ? matchedUniversity.universityName : institution;
      universityCounts[universityName] = (universityCounts[universityName] || 0) + 1;
    } else {
      universityCounts['Unknown'] = (universityCounts['Unknown'] || 0) + 1;
    }
  });

  const sortedUniversities = Object.entries(universityCounts)
    .sort((a, b) => b[1] - a[1]);

  if (sortedUniversities.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Participants by University</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No university data available</p>
        </div>
      </div>
    );
  }

  // Generate colors for the pie chart
  const generateColors = (count) => {
    const colors = [
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(201, 203, 207, 0.6)',
      'rgba(255, 205, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)'
    ];
    const borderColors = [
      'rgba(75, 192, 192, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(201, 203, 207, 1)',
      'rgba(255, 205, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)'
    ];
    
    return {
      backgroundColor: colors.slice(0, count),
      borderColor: borderColors.slice(0, count)
    };
  };

  const data = {
    labels: sortedUniversities.map(([name]) => name),
    datasets: [
      {
        label: 'Number of Participants',
        data: sortedUniversities.map(([, count]) => count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
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
            return `Participants: ${context.parsed.y}`;
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
      <h3 className="chart-title">Participants by University</h3>
      <div className="chart-wrapper">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

