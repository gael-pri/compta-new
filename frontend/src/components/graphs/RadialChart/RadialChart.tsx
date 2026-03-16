import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import styles from './RadialChart.module.css';

ChartJS.register(ArcElement, Legend, Tooltip);

export interface RadialChartProps {
  title?: string;
  description?: string;
  data: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  width?: number;
  height?: number;
  className?: string;
  labelKey?: string;
  valueKey?: string;
  mode?: 'pie' | 'radial';
}

// Interface for arc data for tooltip detection
interface ArcData {
  item: {
    label: string;
    value: number;
    color: string;
  };
  radius: number;
  startAngle: number;
  endAngle: number;
  thickness: number;
}

export default function RadialChart({
  title = "Radial Chart - Label",
  description,
  data,
  width = 400,
  height = 400,
  className = '',
  labelKey = 'browser',
  valueKey = 'visitors',
  mode = 'pie'
}: RadialChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  
  // For handling tooltips in radial mode
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, label: '', value: 0 });

  useEffect(() => {
    if (!chartRef.current) return;

    // Cleanup previous chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Ensure canvas dimensions are properly set
    chartRef.current.width = width;
    chartRef.current.height = height;

    // Assign a unique ID to the canvas
    if (chartRef.current) {
      chartRef.current.id = `radial-chart-${Math.random().toString(36).substring(2, 9)}`;
    }

    if (mode === 'pie') {
      // Create a custom doughnut chart
      chartInstance.current = new ChartJS(ctx, {
        type: 'doughnut',
        data: {
          labels: data.map(item => item.label),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: data.map(item => item.color),
            borderWidth: 0,
            hoverBorderWidth: 0,
            borderRadius: 6,
            spacing: 5,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
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
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value}`;
                }
              }
            }
          }
        }
      });
    } else {
      // Draw concentric radial bar chart similar to the screenshot
      const drawConcentricRadialChart = () => {
        if (!ctx || !chartRef.current) return;
        
        // Clear canvas
        ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);
        
        const centerX = chartRef.current.width / 2;
        const centerY = chartRef.current.height / 2;
        
        // Sort data from highest to lowest for better visual (bigger values = outer rings)
        const sortedData = [...data].sort((a, b) => b.value - a.value);
        
        // Find the max value for scaling
        const maxValue = Math.max(...sortedData.map(item => item.value));
        
        // Chart dimensions
        const innerRadius = Math.min(centerX, centerY) * 0.25; // Central hole size - slightly larger
        const maxRadius = Math.min(centerX, centerY) * 0.9; // Maximum radius
        const barThickness = (maxRadius - innerRadius) / sortedData.length; // Thickness of each arc
        
        // Draw background circles (gray concentric circles)
        for (let i = 0; i < sortedData.length; i++) {
          const radius = innerRadius + (i + 0.5) * barThickness;
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.lineWidth = barThickness * 0.8; // 80% width to leave gaps between rings
          ctx.strokeStyle = 'rgba(229, 231, 235, 0.3)';
          ctx.stroke();
        }
        
        // Store arc data for tooltip calculation
        const arcData: ArcData[] = [];
        
        // Draw data arcs - one colored arc per data item
        sortedData.forEach((item, index) => {
          // Calculate radius for this item's ring
          const radius = innerRadius + (index + 0.5) * barThickness;
          
          // Calculate angles - start at top (-90 degrees)
          const startAngle = -Math.PI / 2;
          // End angle based on value relative to max (close to full circle)
          const endAngle = startAngle + (item.value / maxValue) * Math.PI * 1.8;
          
          // Store arc data for tooltip detection
          arcData.push({
            item,
            radius,
            startAngle,
            endAngle,
            thickness: barThickness * 0.8
          });
          
          // Draw the arc
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, endAngle);
          ctx.lineWidth = barThickness * 0.8;
          ctx.lineCap = 'round';
          ctx.strokeStyle = item.color;
          ctx.stroke();
          
          // Draw label inside the arc
          const labelAngle = startAngle + Math.PI * 0.1; // Slightly offset from start
          const labelRadius = radius;
          
          // Calculate position for text
          const labelX = centerX + Math.cos(labelAngle) * labelRadius;
          const labelY = centerY + Math.sin(labelAngle) * labelRadius;
          
          // Draw the label
          ctx.save();
          ctx.translate(labelX, labelY);
          ctx.rotate(labelAngle + Math.PI / 2); // Rotate text to align with arc
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '12px Arial';
          ctx.fillStyle = '#fff';
          ctx.fillText(item.label, 0, 0);
          
          ctx.restore();
        });
        
        // Function to check if mouse is over an arc
        const handleMouseMove = (e: MouseEvent) => {
          const rect = chartRef.current!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          // Calculate distance from center
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate angle from center (in radians)
          let angle = Math.atan2(dy, dx);
          // Adjust angle to match our chart's orientation (-90° at the top)
          if (angle < -Math.PI / 2) angle += Math.PI * 2;
          
          // Check if mouse is over any arc
          for (const arc of arcData) {
            const radiusDiff = Math.abs(distance - arc.radius);
            // Check if distance from arc radius is within half the thickness
            if (radiusDiff <= arc.thickness / 2) {
              // Check if angle is within arc's angle range
              if (angle >= arc.startAngle && angle <= arc.endAngle) {
                // Show tooltip
                setTooltipVisible(true);
                setTooltipData({
                  x: e.clientX,
                  y: e.clientY,
                  label: arc.item.label,
                  value: arc.item.value
                });
                return;
              }
            }
          }
          
          // Not over any arc
          setTooltipVisible(false);
        };
        
        const handleMouseOut = () => {
          setTooltipVisible(false);
        };
        
        // Set up mouse events for tooltip
        if (chartRef.current) {
          // Remove any existing event listeners
          chartRef.current.removeEventListener('mousemove', handleMouseMove);
          chartRef.current.removeEventListener('mouseout', handleMouseOut);
          
          chartRef.current.addEventListener('mousemove', handleMouseMove);
          chartRef.current.addEventListener('mouseout', handleMouseOut);
        }
      };
      
      // Initial draw
      drawConcentricRadialChart();
      
      // We don't need Chart.js instance for the radial mode
      // as we're drawing directly to canvas
      chartInstance.current = null;
      
      // Add window resize handler to redraw chart
      const handleResize = () => {
        if (chartRef.current) {
          chartRef.current.width = chartRef.current.clientWidth;
          chartRef.current.height = chartRef.current.clientHeight;
          drawConcentricRadialChart();
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.removeEventListener('mousemove', () => {});
          chartRef.current.removeEventListener('mouseout', () => {});
        }
      };
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, totalValue, mode, width, height]);

  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.cardHeader}>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {description && <p className={styles.cardDescription}>{description}</p>}
      </div>

      <div className={styles.cardContent}>
        <div style={{ position: 'relative', width, height, margin: '0 auto' }}>
          <canvas ref={chartRef} width={width} height={height} />
          
          {/* Custom Tooltip for Radial mode */}
          {mode === 'radial' && tooltipVisible && (
            <div 
              className={styles.tooltip}
              style={{ 
                position: 'fixed', 
                left: tooltipData.x + 10,
                top: tooltipData.y + 10,
              }}
            >
              <div className={styles.tooltipTitle}>{tooltipData.label}</div>
              <div className={styles.tooltipValue}>{tooltipData.value}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 