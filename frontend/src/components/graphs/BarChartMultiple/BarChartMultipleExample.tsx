import React from 'react';
import BarChartMultiple from './BarChartMultiple';

export function BarChartMultipleExample() {
  // Using the same data format as in the provided example
  const chartData = {
    xAxisKey: 'month',
    datasets: [
      {
        key: 'desktop',
        label: 'Desktop',
        color: 'hsl(var(--chart-1, 240 60% 50%))'
      },
      {
        key: 'mobile',
        label: 'Mobile',
        color: 'hsl(var(--chart-2, 120 60% 45%))'
      }
    ],
    items: [
      { month: "January", desktop: 186, mobile: 80 },
      { month: "February", desktop: 305, mobile: 200 },
      { month: "March", desktop: 237, mobile: 120 },
      { month: "April", desktop: 73, mobile: 190 },
      { month: "May", desktop: 209, mobile: 130 },
      { month: "June", desktop: 214, mobile: 140 }
    ]
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <BarChartMultiple
        title="Bar Chart - Multiple"
        description="January - June 2024"
        data={chartData}
        width={700}
        height={350}
      />
    </div>
  );
} 