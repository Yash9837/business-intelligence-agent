import { useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components explicitly to avoid issues
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface HistoryItem {
  question: string;
  timestamp: string;
}

interface ResponseData {
  question: string;
  sqlQuery: string;
  data: any[];
  explanation: string;
  visualizationType: string;
}

export default function App() {
  const [query, setQuery] = useState<string>('');
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Define askQuestion inside the App component to ensure scope
  const askQuestion = async (question: string) => {
    const response = await fetch('http://localhost:3001/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await askQuestion(query);
      setResponse(data);
      setHistory(prev => [...prev, {
        question: query,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (err: any) {
      setError('Failed to get response. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderVisualization = () => {
    if (!response?.data?.length) {
      return <p className="text-gray-500">No data available for visualization.</p>;
    }

    const firstRow = response.data[0];
    const keys = Object.keys(firstRow);

    if (keys.length < 2) {
      return (
        <div className="overflow-auto max-h-96 bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {keys.map(key => (
                  <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {response.data.map((row: any, i: number) => (
                <tr key={i}>
                  {Object.values(row).map((value: any, j: number) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    const labels = response.data.map((item: any) => item[keys[0]]);
    const values = response.data.map((item: any) => item[keys[1]]);

    const chartData = {
      labels,
      datasets: [{
        label: keys[1],
        data: values,
        backgroundColor: '#3b82f6',
        borderColor: '#1d4ed8',
        fill: response.visualizationType === 'line' ? false : true,
      }]
    };

    switch (response.visualizationType) {
      case 'bar':
        return <Bar data={chartData} />;
      case 'line':
        return <Line data={chartData} />;
      default:
        return (
          <div className="overflow-auto max-h-96 bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {keys.map(key => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {response.data.map((row: any, i: number) => (
                  <tr key={i}>
                    {Object.values(row).map((value: any, j: number) => (
                      <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
    }
  };

  const sampleQuestions = [
    "Show monthly revenue trends",
    "Who are our top 5 customers by spend?",
    "Which products have the highest return rate?",
    "Compare sales between product categories"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Business Intelligence Agent
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ask natural language questions about your data
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Query Input */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                  Ask a business question
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 p-2 border"
                    placeholder="e.g., What were our top selling products last quarter?"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : 'Analyze'}
                </button>

                <div className="text-sm">
                  <span className="text-gray-500">Try: </span>
                  {sampleQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setQuery(q)}
                      className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          {response && (
            <div className="space-y-6">
              {/* Explanation Card */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Insights</h2>
                <div className="prose prose-blue max-w-none">
                  <p>{response.explanation}</p>
                </div>
              </div>

              {/* Visualization */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Visualization</h2>
                <div className="mt-4">
                  {renderVisualization()}
                </div>
              </div>

              {/* SQL Query */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Generated SQL</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                  {response.sqlQuery}
                </pre>
              </div>
            </div>
          )}

          {/* Query History */}
          {history.length > 0 && (
            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Queries</h2>
              <ul className="divide-y divide-gray-200">
                {history.map((item, index) => (
                  <li key={index} className="py-4 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900">{item.question}</div>
                    <div className="text-sm text-gray-500">{item.timestamp}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}