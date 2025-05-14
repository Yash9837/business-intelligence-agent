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

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function ChartComponent({ data, visualizationType }) {
  if (!data || data.length === 0) return null;

  const labels = data.map(row => Object.values(row)[0]);
  const values = data.map(row => Object.values(row)[1]);

  const chartData = {
    labels,
    datasets: [
      {
        label: Object.keys(data[0])[1],
        data: values,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top', labels: { color: '#e5e7eb' } },
      title: { display: true, text: 'Query Results', color: '#e5e7eb' },
    },
    scales: {
      x: { ticks: { color: '#e5e7eb' }, grid: { color: '#374151' } },
      y: { ticks: { color: '#e5e7eb' }, grid: { color: '#374151' } },
    },
  };

  return visualizationType === 'bar' ? (
    <Bar data={chartData} options={options} />
  ) : (
    <Line data={chartData} options={options} />
  );
}

export default ChartComponent;