import { useState } from 'react';
import { Upload, FileText, Database, Send, AlertCircle, ChevronDown, Info, TrendingUp, PieChart, BarChart2, LineChart } from 'lucide-react';
import Navbar from '../components/Navbar';
import QueryResult from '../components/QueryResults';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

interface PastQuery {
  question: string;
  timestamp: string;
}

const API_BASE_URL = 'https://intelligence-agent.onrender.com';

const Dashboard: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [useUploadedData, setUseUploadedData] = useState<boolean>(false);
  const [question, setQuestion] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [showDatasetInfo, setShowDatasetInfo] = useState<boolean>(false);
  const [pastQueries, setPastQueries] = useState<PastQuery[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUseUploadedData(true);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/upload-csv`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('CSV uploaded successfully!');
        setUseUploadedData(true);
      } else {
        setError(data.error || 'Failed to upload CSV');
      }
    } catch (err) {
      const error = err as Error;
      setError('Error uploading CSV: ' + (error.message || 'Network error'));
    } finally {
      setUploadLoading(false);
    }
  };

  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          useUserData: useUploadedData,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        setPastQueries((prev) => {
          const newQueries = [{ question, timestamp: new Date().toISOString() }, ...prev];
          return newQueries.slice(0, 5);
        });
      } else {
        setError(data.error || 'Failed to fetch query results');
      }
    } catch (err) {
      const error = err as Error;
      setError('Error fetching query results: ' + (error.message || 'Network error'));
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (exampleQuestion: string) => {
    setQuestion(exampleQuestion);
  };

  const getExampleQueries = (): string[] => {
    if (useUploadedData) {
      return [
        "What are the top items in my dataset?",
        "Show me trends over time if dates are available",
        "Find outliers in my numerical columns",
      ];
    } else {
      return [
        "Who are our top 5 clients by total sales?",
        "What is the revenue trend by month in 2023?",
        "Which product category has the highest profit margin?",
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      {notification && (
        <div
          className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 z-50 ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          <p className="text-white font-medium">{notification.message}</p>
        </div>
      )}

      {/* Main content container with new padding */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header section with new margin */}
        <section className="welcome-section mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="welcome-text text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500">
                Insights.AI Dashboard
              </h1>
              <p className="text-gray-300">Ask questions and discover insights from your data</p>
            </div>
            <div className="sm:mt-0">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-1 text-sm inline-flex shadow-md">
                <button
                  className={`px-4 py-2 rounded-md transition duration-200 ${
                    !useUploadedData
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setUseUploadedData(false)}
                >
                  Sample Data
                </button>
                <button
                  className={`px-4 py-2 rounded-md transition duration-200 ${
                    useUploadedData
                      ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setUseUploadedData(true)}
                >
                  My Data
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Grid layout with new gap and column sizing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {/* Sidebar: Adjusted column span */}
          <aside className="sm:col-span-1 lg:col-span-2 space-y-8">
            {/* Data Source Card */}
            <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0">
              <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="h-6 w-6 mr-3 text-blue-400" />
                    Data Source
                  </h2>
                  <button
                    onClick={() => setShowDatasetInfo(!showDatasetInfo)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <ChevronDown
                      className={`h-6 w-6 transform ${showDatasetInfo ? 'rotate-180' : ''} transition-transform`}
                    />
                  </button>
                </div>
              </div>

              {showDatasetInfo && (
                <div className="px-8 py-6 bg-gray-750 border-b border-gray-700 text-sm text-gray-300">
                  <p>Upload a CSV file to analyze your own data or use our sample dataset to explore the platform's capabilities.</p>
                </div>
              )}

              <div className="p-8">
                <form onSubmit={handleUpload} className="space-y-6">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition cursor-pointer">
                    <label className="w-full h-full cursor-pointer">
                      <div className="flex flex-col items-center justify-center py-3">
                        <Upload className="h-10 w-10 text-gray-400 mb-3" />
                        {file ? (
                          <span className="text-blue-400 font-medium text-lg">{file.name}</span>
                        ) : (
                          <>
                            <span className="text-base font-medium text-gray-300">Drop your CSV file here or</span>
                            <span className="text-blue-400 font-medium text-lg">browse</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-3 text-base text-gray-300">
                      <input
                        type="checkbox"
                        checked={useUploadedData}
                        onChange={(e) => setUseUploadedData(e.target.checked)}
                        className="h-5 w-5 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <span>Use uploaded dataset</span>
                    </label>

                    <button
                      type="submit"
                      disabled={uploadLoading || !file}
                      className={`px-6 py-3 rounded-md text-base font-medium text-white ${
                        uploadLoading || !file
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
                      } transition shadow-md`}
                    >
                      {uploadLoading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Quick Stats Card */}
            <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0">
              <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <PieChart className="h-6 w-6 mr-3 text-blue-400" />
                  Quick Stats
                </h2>
              </div>
              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="bg-gray-750 rounded-lg p-6 hover:bg-gray-700 transition duration-300">
                  <p className="text-gray-400 text-base mb-2">Data Source</p>
                  <p className="text-xl font-medium">{useUploadedData ? (file ? file.name : 'No file') : 'Sample Data'}</p>
                </div>
                <div className="bg-gray-750 rounded-lg p-6 hover:bg-gray-700 transition duration-300">
                  <p className="text-gray-400 text-base mb-2">Queries Run</p>
                  <p className="text-xl font-medium">{pastQueries.length}</p>
                </div>
              </div>
            </section>

            {/* Example Queries Card */}
            <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0 max-h-[400px] overflow-y-auto">
              <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Database className="h-6 w-6 mr-3 text-blue-400" />
                  Example Queries
                </h2>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  {getExampleQueries().map((exampleQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(exampleQuery)}
                      className="w-full text-left p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition duration-200 text-gray-300 hover:text-white flex items-center text-base"
                    >
                      <Send className="h-5 w-5 mr-3 text-blue-400" />
                      <span>{exampleQuery}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Queries Card */}
            {pastQueries.length > 0 && (
              <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0 max-h-[400px] overflow-y-auto">
                <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <LineChart className="h-6 w-6 mr-3 text-blue-400" />
                    Recent Queries
                  </h2>
                </div>
                <div className="p-8">
                  <div className="space-y-4">
                    {pastQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(query.question)}
                        className="w-full text-left p-4 bg-gray-750 hover:bg-gray-700 rounded-lg transition duration-200 text-gray-300 hover:text-white flex items-center text-base"
                      >
                        <BarChart2 className="h-5 w-5 mr-3 text-blue-400" />
                        <span className="truncate">{query.question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </aside>

          {/* Main Content: Adjusted column span */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-8">
            {/* Ask a Question Card */}
            <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0">
              <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Send className="h-6 w-6 mr-3 text-blue-400" />
                  Ask a Question
                </h2>
              </div>
              <div className="p-8">
                <form onSubmit={handleQuerySubmit} className="space-y-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., Who are our top 5 clients by total sales?"
                      className="w-full p-4 pr-14 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`absolute right-3 top-3 p-2 rounded-md ${
                        loading ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
                      } transition shadow-md`}
                    >
                      <Send className="h-6 w-6 text-white" />
                    </button>
                  </div>

                  <div className="flex items-center text-base text-gray-400">
                    <Info className="h-5 w-5 mr-2" />
                    <span>Ask in natural language about your data</span>
                  </div>
                </form>
              </div>
            </section>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-white rounded-lg p-8 flex items-start">
                <AlertCircle className="h-6 w-6 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-base">{error}</p>
              </div>
            )}

            {/* Query Results */}
            {result && (
              <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300 py-0">
                <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-blue-400" />
                    Query Results
                  </h2>
                </div>
                <div className="p-8">
                  <QueryResult result={result} />
                </div>
              </section>
            )}

            {/* Loading State */}
            {loading && !result && (
              <section className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden py-0">
                <div className="p-8 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white">Processing Query</h2>
                </div>
                <div className="p-16 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-6"></div>
                  <p className="text-gray-400 text-lg">Analyzing your data...</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;