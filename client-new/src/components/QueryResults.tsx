import React from 'react';
import ChartComponent from './ChartComponent';
import { ChartData, ChartOptions } from 'chart.js';

interface QueryResultProps {
  result: {
    question: string;
    sqlQuery: string;
    data: any[];
    visualizationType: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    explanation: string;
  } | null;
}

const QueryResult: React.FC<QueryResultProps> = ({ result }) => {
  if (!result || !result.data) {
    return <div className="text-gray-400">No results to display</div>;
  }

  const { data, visualizationType, xAxisLabel, yAxisLabel, explanation } = result;

  // Prepare chart data
  let chartData: ChartData<'bar' | 'line'> | null = null;
  let chartOptions: ChartOptions<'bar' | 'line'> = {};

  if (visualizationType === 'bar' || visualizationType === 'line') {
    const labels = data.map(item => item[Object.keys(item)[0]]);
    const values = data.map(item => item[Object.keys(item)[1]]);

    chartData = {
      labels,
      datasets: [
        {
          label: yAxisLabel || 'Values',
          data: values,
          backgroundColor: visualizationType === 'bar' ? 'rgba(74, 222, 128, 0.6)' : undefined,
          borderColor: visualizationType === 'line' ? 'rgba(74, 222, 128, 1)' : undefined,
          borderWidth: visualizationType === 'line' ? 2 : undefined,
          fill: visualizationType === 'line' ? false : undefined,
          tension: visualizationType === 'line' ? 0.3 : undefined
        }
      ]
    };

    chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: { color: '#e2e8f0' }
        },
        title: {
          display: true,
          text: result.question,
          color: '#f1f5f9',
          font: { size: 16 }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: xAxisLabel || 'X-Axis',
            color: '#e2e8f0'
          },
          ticks: { color: '#94a3b8' }
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel || 'Y-Axis',
            color: '#e2e8f0'
          },
          ticks: { color: '#94a3b8' },
          beginAtZero: true
        }
      }
    };
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Question: {result.question}</h3>
      <h4 className="text-lg font-medium text-gray-300 mb-2">SQL Query:</h4>
      <pre className="mb-4">{result.sqlQuery}</pre>

      <h4 className="text-lg font-medium text-gray-300 mb-2">Results:</h4>
      {visualizationType === 'table' || !chartData ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {data.length > 0 && Object.keys(data[0]).map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex}>{String(value)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-700 p-4 rounded-md">
          <ChartComponent type={visualizationType as 'bar' | 'line'} data={chartData} options={chartOptions} />
        </div>
      )}

      <h4 className="text-lg font-medium text-gray-300 mt-6 mb-2">Business Insights:</h4>
      <ul className="list-disc pl-5 space-y-1">
        {explanation.split('\n- ').map((point, index) => (
          <li key={index} className="text-gray-200">
            {point.replace('- ', '')}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QueryResult;