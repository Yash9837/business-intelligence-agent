import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-300">
          Insights.AI
        </Link>
        <div className="space-x-4">
          <Link to="/" className="text-gray-300 hover:text-blue-300">
            Home
          </Link>
          <Link to="/dashboard" className="text-gray-300 hover:text-blue-300">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;