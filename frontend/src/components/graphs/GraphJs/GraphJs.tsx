import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { ChartConfiguration, ChartTypeRegistry } from 'chart.js';
import styles from './GraphJs.module.css';

export interface GraphJsProps {
  type: keyof ChartTypeRegistry;
  data: {
    labels?: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
      pointBackgroundColor?: string | string[];
      pointBorderColor?: string | string[];
      pointRadius?: number;
      [key: string]: any;
    }[];
  };
  options?: object;
  width?: number;
  height?: number;
  className?: string;
  title?: string;
}

export default function GraphJs({
  type,
  data,
  options = {},
  width = 400,
  height = 300,
  className = '',
  title
}: GraphJsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    // Create new chart
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      const config: ChartConfiguration = {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }
      };

      chartRef.current = new Chart(ctx, config);
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div className={`${styles.container} ${className}`} style={{ width, height }}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
} 