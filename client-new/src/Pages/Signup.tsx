import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Signup Coming Soon</h1>
        <p className="text-xl text-gray-300 mb-8">
          Sign up to get started with Silver Insights. Feature coming soon!
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition duration-300"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Signup;