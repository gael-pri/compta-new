import React from 'react';
import RadialChart from './RadialChart';

export function RadialChartExample() {
  // Sample data for the radial chart
  const chartData = [
    { label: "Chrome", value: 275, color: "hsl(240, 60%, 50%)" },
    { label: "Safari", value: 200, color: "hsl(120, 60%, 45%)" },
    { label: "Firefox", value: 187, color: "hsl(30, 80%, 55%)" },
    { label: "Edge", value: 173, color: "hsl(270, 60%, 50%)" },
    { label: "Other", value: 90, color: "hsl(200, 60%, 50%)" }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <RadialChart
        title="Radial Chart - Label"
        description="January - June 2024"
        data={chartData}
        width={400}
        height={400}
      />
    </div>
  );
} 