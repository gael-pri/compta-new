import React from 'react';
import GraphJS from './GraphJs';

export function BarChartExample() {
  return (
    <GraphJS
      title="Total customers"
      type="bar"
      width={400}
      height={250}
      data={{
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Series 1',
            data: [65, 59, 80, 81, 56, 55, 40],
            backgroundColor: 'rgba(86, 40, 173, 0.8)',
          },
          {
            label: 'Series 2',
            data: [28, 48, 40, 19, 86, 27, 90],
            backgroundColor: 'rgba(137, 96, 222, 0.8)',
          },
          {
            label: 'Series 3',
            data: [45, 25, 16, 36, 67, 18, 76],
            backgroundColor: 'rgba(175, 143, 233, 0.8)',
          },
          {
            label: 'Series 4',
            data: [17, 62, 78, 88, 42, 44, 28],
            backgroundColor: 'rgba(205, 180, 241, 0.8)',
          },
          {
            label: 'Series 5',
            data: [38, 28, 55, 41, 17, 33, 85],
            backgroundColor: 'rgba(222, 209, 244, 0.8)',
          },
          {
            label: 'Series 6',
            data: [12, 34, 25, 49, 64, 10, 53],
            backgroundColor: 'rgba(240, 232, 252, 0.8)',
          }
        ],
      }}
      options={{
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          }
        }
      }}
    />
  );
}

export function DoughnutChartExample() {
  return (
    <GraphJS
      title="Dominantes"
      type="doughnut"
      width={400}
      height={250}
      data={{
        labels: ['Series 1', 'Series 2', 'Series 3', 'Series 4', 'Series 5', 'Series 6'],
        datasets: [
          {
            label: 'Distribution',
            data: [120, 80, 60, 30, 15, 11],
            backgroundColor: [
              'rgba(86, 40, 173, 0.8)',
              'rgba(137, 96, 222, 0.8)',
              'rgba(175, 143, 233, 0.8)',
              'rgba(205, 180, 241, 0.8)',
              'rgba(222, 209, 244, 0.8)',
              'rgba(240, 232, 252, 0.8)'
            ],
          }
        ]
      }}
      options={{
        plugins: {
          legend: {
            position: 'right',
          }
        },
        cutout: '70%'
      }}
    />
  );
}

export function PieChartExample() {
  return (
    <GraphJS
      title="Impact/Priorité"
      type="pie"
      width={400}
      height={250}
      data={{
        labels: ['Noir', 'Rouge', 'Orange', 'Jaune', 'Blanc'],
        datasets: [
          {
            label: 'Priorité',
            data: [25, 20, 30, 15, 10],
            backgroundColor: [
              '#444444',
              '#FF3B30',
              '#FF9500',
              '#FFCC00',
              '#F5F5F7'
            ],
          }
        ]
      }}
      options={{
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }}
    />
  );
}

export function LineChartExample() {
  return (
    <GraphJS
      title="Performance Trends"
      type="line"
      width={400}
      height={250}
      data={{
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
          {
            label: 'Metric 1',
            data: [65, 59, 80, 81, 56, 55, 40],
            borderColor: 'rgba(86, 40, 173, 1)',
            backgroundColor: 'rgba(86, 40, 173, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Metric 2',
            data: [28, 48, 40, 19, 86, 27, 90],
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      }}
      options={{
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }}
    />
  );
}

export function RadarChartExample() {
  return (
    <GraphJS
      title="Skills Assessment"
      type="radar"
      width={400}
      height={400}
      data={{
        labels: ['Communication', 'Technical', 'Teamwork', 'Problem Solving', 'Adaptability', 'Leadership'],
        datasets: [
          {
            label: 'Employee A',
            data: [85, 75, 90, 80, 85, 70],
            backgroundColor: 'rgba(86, 40, 173, 0.2)',
            borderColor: 'rgba(86, 40, 173, 1)',
            pointBackgroundColor: 'rgba(86, 40, 173, 1)'
          },
          {
            label: 'Employee B',
            data: [65, 90, 70, 95, 75, 80],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      }}
      options={{
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              stepSize: 20
            }
          }
        }
      }}
    />
  );
} 