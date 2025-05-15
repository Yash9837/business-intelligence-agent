import React, { useState, useEffect } from 'react';
import { Upload, FileText, Database, Send, AlertCircle, ChevronDown, Info, TrendingUp, PieChart, BarChart2, LineChart } from 'lucide-react';
import Navbar from '../components/Navbar';
import QueryResult from '../components/QueryResults';

const Dashboard = () => {
  const [file, setFile] = useState(null);
  const [useUploadedData, setUseUploadedData] = useState(false);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showDatasetInfo, setShowDatasetInfo] = useState(false);
  const [pastQueries, setPastQueries] = useState([]);
  const [notification, setNotification] = useState(null);

  // Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUseUploadedData(true);
    }
  };

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    setError(null);

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('http://localhost:3001/api/upload-csv', {
        method: 'POST',
        body: file,
        headers: {
          'Content-Type': 'text/csv'
        }
      });

      const data = await response.json();
      if (response.ok) {
        showNotification('CSV uploaded successfully!');
        setUseUploadedData(true);
      } else {
        setError(data.error || 'Failed to upload CSV');
      }
    } catch (err) {
      setError('Error uploading CSV: ' + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle query submission
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3001/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          useUserData: useUploadedData
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
        // Add to past queries
        setPastQueries(prev => {
          const newQueries = [{ question, timestamp: new Date().toISOString() }, ...prev];
          return newQueries.slice(0, 5); // Keep only last 5 queries
        });
      } else {
        setError(data.error || 'Failed to fetch query results');
      }
    } catch (err) {
      setError('Error fetching query results: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle example query click
  const handleExampleClick = (exampleQuestion) => {
    setQuestion(exampleQuestion);
  };

  // Example queries based on data source
  const getExampleQueries = () => {
    if (useUploadedData) {
      return [
        "What are the top items in my dataset?",
        "Show me trends over time if dates are available",
        "Find outliers in my numerical columns"
      ];
    } else {
      return [
        "Who are our top 5 clients by total sales?",
        "What is the revenue trend by month in 2023?",
        "Which product category has the highest profit margin?"
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />

      {/* Notification */}
      {notification && (
        <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-0 z-50 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          <p className="text-white font-medium">{notification.message}</p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500">
              Data Analysis Dashboard
            </h1>
            <p className="text-gray-300 mt-1">Ask questions and discover insights from your data</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-1 text-sm inline-flex shadow-md">
              <button 
                className={`px-4 py-2 rounded-md transition duration-200 ${!useUploadedData ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setUseUploadedData(false)}
              >
                Sample Data
              </button>
              <button 
                className={`px-4 py-2 rounded-md transition duration-200 ${useUploadedData ? 'bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-md' : 'text-gray-300 hover:text-white'}`}
                onClick={() => setUseUploadedData(true)}
              >
                My Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout for larger screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload and Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Dataset Upload Card */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
              <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-400" />
                    Data Source
                  </h2>
                  <button 
                    onClick={() => setShowDatasetInfo(!showDatasetInfo)}
                    className="text-gray-400 hover:text-white transition"
                  >
                    <ChevronDown className={`h-5 w-5 transform ${showDatasetInfo ? 'rotate-180' : ''} transition-transform`} />
                  </button>
                </div>
              </div>
              
              {showDatasetInfo && (
                <div className="px-5 py-3 bg-gray-750 border-b border-gray-700 text-sm text-gray-300">
                  <p>Upload a CSV file to analyze your own data or use our sample dataset to explore the platform's capabilities.</p>
                </div>
              )}
              
              <div className="p-5">
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                    <label className="w-full h-full cursor-pointer">
                      <div className="flex flex-col items-center justify-center py-2">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        {file ? (
                          <span className="text-blue-400 font-medium">{file.name}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-300">Drop your CSV file here or</span>
                            <span className="text-blue-400 font-medium">browse</span>
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
                    <label className="flex items-center space-x-2 text-sm text-gray-300">
                      <input
                        type="checkbox"
                        checked={useUploadedData}
                        onChange={(e) => setUseUploadedData(e.target.checked)}
                        className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-600 rounded"
                      />
                      <span>Use uploaded dataset</span>
                    </label>

                    <button
                      type="submit"
                      disabled={uploadLoading || !file}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
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
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
              <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-blue-400" />
                  Quick Stats
                </h2>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition duration-300">
                  <p className="text-gray-400 text-sm">Data Source</p>
                  <p className="text-lg font-medium">{useUploadedData ? (file ? file.name : 'No file') : 'Sample Data'}</p>
                </div>
                <div className="bg-gray-750 rounded-lg p-4 hover:bg-gray-700 transition duration-300">
                  <p className="text-gray-400 text-sm">Queries Run</p>
                  <p className="text-lg font-medium">{pastQueries.length}</p>
                </div>
              </div>
            </div>

            {/* Example Queries Card */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
              <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Database className="h-5 w-5 mr-2 text-blue-400" />
                  Example Queries
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-2">
                  {getExampleQueries().map((exampleQuery, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(exampleQuery)}
                      className="w-full text-left p-3 bg-gray-750 hover:bg-gray-700 rounded-lg transition duration-200 text-gray-300 hover:text-white flex items-center"
                    >
                      <Send className="h-4 w-4 mr-2 text-blue-400" />
                      <span>{exampleQuery}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Queries Card */}
            {pastQueries.length > 0 && (
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
                <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <LineChart className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Queries
                  </h2>
                </div>
                <div className="p-5">
                  <div className="space-y-2">
                    {pastQueries.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(query.question)}
                        className="w-full text-left p-3 bg-gray-750 hover:bg-gray-700 rounded-lg transition duration-200 text-gray-300 hover:text-white flex items-center"
                      >
                        <BarChart2 className="h-4 w-4 mr-2 text-blue-400" />
                        <span className="truncate">{query.question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Query and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Query Input Card */}
            <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
              <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <Send className="h-5 w-5 mr-2 text-blue-400" />
                  Ask a Question
                </h2>
              </div>
              <div className="p-5">
                <form onSubmit={handleQuerySubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="e.g., Who are our top 5 clients by total sales?"
                      className="w-full p-4 pr-12 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className={`absolute right-2 top-2 p-2 rounded-md ${
                        loading ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600'
                      } transition shadow-md`}
                    >
                      <Send className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-400">
                    <Info className="h-4 w-4 mr-1" />
                    <span>Ask in natural language about your data</span>
                  </div>
                </form>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500 text-white rounded-lg p-4 flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Query Results */}
            {result && (
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden hover:border-blue-400 transition duration-300">
                <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                    Query Results
                  </h2>
                </div>
                <div className="p-5">
                  <QueryResult result={result} />
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && !result && (
              <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                  <h2 className="text-lg font-semibold text-white">Processing Query</h2>
                </div>
                <div className="p-16 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-400">Analyzing your data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;