import React from 'react';
import '../../css/charts/KPICards.css';

export default function KPICards({ metrics }) {
  const { totalUsers, totalEvents } = metrics;

  const kpiData = [
    {
      title: 'Total Users',
      value: totalUsers,
      color: '#4A90E2',
      bgColor: '#E3F2FD'
    },
    {
      title: 'Total Events',
      value: totalEvents,
      color: '#50C878',
      bgColor: '#E8F5E9'
    },
  ];

  return (
    <div className="kpi-cards-container">
      {kpiData.map((kpi, index) => {
        const isLastTwo = index >= kpiData.length - 2;
        return (
          <div 
            key={index} 
            className={`kpi-card ${isLastTwo ? 'kpi-card-last-row' : ''}`} 
            style={{ borderTopColor: kpi.color }}
          >
            <div className="kpi-content">
              <h3 className="kpi-title">{kpi.title}</h3>
              <p className="kpi-value" style={{ color: kpi.color }}>
                {kpi.value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

