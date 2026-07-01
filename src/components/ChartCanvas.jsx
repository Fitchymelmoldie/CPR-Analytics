import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
Chart.register(ChartDataLabels, annotationPlugin);
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.color = '#94a3b8';
export default     function ChartCanvas({ type, data, options, height }) {
      const canvasRef = useRef(null);
      const chartRef = useRef(null);

      useEffect(() => {
        if (!canvasRef.current) return;

        // Destroy previous chart instance
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }

        const ctx = canvasRef.current.getContext('2d');
        chartRef.current = new Chart(ctx, {
          type: type,
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyle: 'circle', padding: 20 }
              },
              datalabels: {
                color: '#e2e8f0',
                backgroundColor: 'rgba(38, 42, 51, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                borderRadius: 6,
                padding: { top: 4, bottom: 4, left: 8, right: 8 },
                font: { family: 'Inter', weight: '600', size: 11 },
                anchor: 'center',
                align: (ctx) => {
                  if (ctx.dataIndex === 0) return 'end';
                  if (ctx.dataset.data.length > 1 && ctx.dataIndex === ctx.dataset.data.length - 1) return 'start';
                  return 'top';
                },
                offset: (ctx) => {
                  if (ctx.dataIndex === 0 || ctx.dataIndex === ctx.dataset.data.length - 1) return 10;
                  return 8;
                },
                formatter: (value) => {
                  if (options && options._yFormat) return options._yFormat(value);
                  return value;
                }
              },
              tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#93c5fd',
                bodyColor: '#e2e8f0',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                titleFont: { family: 'Inter', weight: '600' },
                bodyFont: { family: 'Inter' },
                callbacks: options && options._tooltipCallbacks ? options._tooltipCallbacks : undefined,
              },
            },
            scales: {
              x: {
                ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { color: '#334155' },
              },
              y: {
                ticks: {
                  color: '#94a3b8',
                  font: { family: 'Inter', size: 11 },
                  callback: options && options._yFormat ? options._yFormat : undefined,
                },
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { color: '#334155' },
                ...(options && options._yScale ? options._yScale : {}),
              },
            },
            ...options,
          },
        });

        return () => {
          if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
          }
        };
      }, [type, data, options]);

      return (
        <div style={{ position: 'relative', height: height || '320px', width: '100%' }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      );
    }

