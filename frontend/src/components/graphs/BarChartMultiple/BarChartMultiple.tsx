import React from 'react';
import GraphJS from '../GraphJs/GraphJs';
import styles from './BarChartMultiple.module.css';

export interface BarChartMultipleProps {
  title?: string;
  description?: string;
  data: {
    xAxisKey: string;
    datasets: Array<{
      key: string;
      label: string;
      color: string;
    }>;
    items: Array<Record<string, any>>;
  };
  width?: number;
  height?: number;
  className?: string;
}

export default function BarChartMultiple({
  title = "Bar Chart - Multiple",
  description,
  data,
  width = 600,
  height = 400,
  className = ''
}: BarChartMultipleProps) {
  
  // Transform the data for Chart.js
  const chartData = {
    labels: data.items.map(item => item[data.xAxisKey]),
    datasets: data.datasets.map(dataset => ({
      label: dataset.label,
      data: data.items.map(item => item[dataset.key]),
      backgroundColor: dataset.color,
      borderColor: dataset.color,
      borderWidth: 0,
      borderRadius: 4,
      barPercentage: 0.6,
      categoryPercentage: 0.7
    }))
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(17, 24, 39, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 10,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          size: 13
        },
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        callbacks: {
          title: (tooltipItems: any[]) => {
            return tooltipItems[0].label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          padding: 10,
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 12
          },
          callback: (value: any, index: number) => {
            // Format the x-axis label (like taking first 3 chars)
            const label = data.items[index][data.xAxisKey];
            return typeof label === 'string' ? label.slice(0, 3) : label;
          }
        },
        border: {
          display: false
        },
        stacked: false
      },
      y: {
        grid: {
          color: 'rgba(243, 244, 246, 1)',
          drawBorder: false,
        },
        border: {
          display: false
        },
        ticks: {
          padding: 10,
          color: 'rgba(107, 114, 128, 0.8)',
          font: {
            size: 12
          }
        },
        stacked: false
      }
    }
  };

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardHeader}>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>

      <div className={styles.cardContent}>
        <GraphJS 
          type="bar"
          data={chartData}
          options={chartOptions}
          width={width}
          height={height}
        />
      </div>
    </div>
  );
} 