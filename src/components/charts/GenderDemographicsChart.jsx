import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GenderDemographicsChart({ participantsData }) {
  // Count participants by gender
  const genderCounts = {
    Male: 0,
    Female: 0,
    Other: 0,
    Unknown: 0
  };
  
  if (!participantsData || participantsData.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Participant Gender Demographic</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No participants data available</p>
        </div>
      </div>
    );
  }

  participantsData.forEach(participant => {
    const gender = participant.gender;
    if (gender) {
      const normalizedGender = gender.trim();
      if (normalizedGender.toLowerCase() === 'male' || normalizedGender.toLowerCase() === 'm') {
        genderCounts.Male++;
      } else if (normalizedGender.toLowerCase() === 'female' || normalizedGender.toLowerCase() === 'f') {
        genderCounts.Female++;
      } else if (normalizedGender.toLowerCase() === 'other' || normalizedGender.toLowerCase() === 'o') {
        genderCounts.Other++;
      } else {
        genderCounts.Other++;
      }
    } else {
      genderCounts.Unknown++;
    }
  });

  // Filter out categories with zero count
  const genderEntries = Object.entries(genderCounts).filter(([, count]) => count > 0);

  if (genderEntries.length === 0) {
    return (
      <div className="chart-container">
        <h3 className="chart-title">Gender Demographics</h3>
        <div className="chart-wrapper">
          <p style={{ textAlign: 'center', color: '#666', paddingTop: '100px' }}>No gender data available</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: genderEntries.map(([gender]) => gender),
    datasets: [
      {
        label: 'Participants by Gender',
        data: genderEntries.map(([, count]) => count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',  // Blue for Male
          'rgba(255, 99, 132, 0.6)',  // Pink/Red for Female
          'rgba(153, 102, 255, 0.6)', // Purple for Other
          'rgba(201, 203, 207, 0.6)'  // Gray for Unknown
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(201, 203, 207, 1)'
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
      <h3 className="chart-title">Gender Demographics</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

