import { useState } from 'react';
import ChartComponent from '../components/ChartComponent';

function Dashboard() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exampleQuestions = [
    'Who are our top 5 clients by total sales amount in 2023, excluding returned sales?',
    'What is the monthly sales trend for Necklaces in 2023?',
    'Which items have the highest return rate in 2023?',
    'Which suppliers provide the most cost-effective items based on supply price vs sale price?',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch data');
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setQuestion(example);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-blue-300 mb-4">Example Questions</h2>
        <ul className="space-y-2">
          {exampleQuestions.map((q, idx) => (
            <li key={idx}>
              <button
                onClick={() => handleExampleClick(q)}
                className="text-gray-300 hover:text-blue-300 text-sm text-left"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-blue-300 mb-6">Dashboard</h1>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a business question (e.g., Who are our top 5 clients?)"
              className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Ask'}
            </button>
          </div>
        </form>

        {/* Results */}
        {error && <div className="text-red-400 mb-4">{error}</div>}
        {response && (
          <div className="space-y-6">
            

            {/* Results Visualization */}
            <div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">Results</h2>
              {response.visualizationType === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse bg-gray-700 rounded-lg">
                    <thead>
                      <tr className="bg-gray-600">
                        {response.data.length > 0 &&
                          Object.keys(response.data[0]).map((key) => (
                            <th key={key} className="p-3 text-gray-200">
                              {key}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      {response.data.map((row, idx) => (
                        <tr key={idx} className="border-t border-gray-600">
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="p-3 text-gray-300">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <ChartComponent data={response.data} visualizationType={response.visualizationType} />
                </div>
              )}
            </div>

            {/* Explanation */}
            <div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">Business Insights</h2>
              <p className="bg-gray-700 p-4 rounded-lg text-gray-200">{response.explanation}</p>
            </div>
            {/* SQL Query */}
            <div>
              <h2 className="text-xl font-semibold text-gray-300 mb-2">Generated SQL Query</h2>
              <pre className="bg-gray-700 p-4 rounded-lg text-gray-200 text-sm">
                {response.sqlQuery}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;