import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ChartComponentProps {
  type: 'bar' | 'line';
  data: ChartData<'bar' | 'line'>;
  options: ChartOptions<'bar' | 'line'>;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ type, data, options }) => {
  if (type === 'bar') {
    return <Bar data={data as ChartData<'bar'>} options={options} />;
  } else if (type === 'line') {
    return <Line data={data as ChartData<'line'>} options={options} />;
  }
  return null;
};

export default ChartComponent;