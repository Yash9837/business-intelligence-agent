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
  Legend
} from 'chart.js';

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

const ChartComponent = ({ type, data, options }) => {
  if (type === 'bar') {
    return <Bar data={data} options={options} />;
  } else if (type === 'line') {
    return <Line data={data} options={options} />;
  }
  return null;
};

export default ChartComponent;