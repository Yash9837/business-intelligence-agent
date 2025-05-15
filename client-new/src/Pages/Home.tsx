import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PieChart, Zap, ChevronRight, Database, LineChart, Award } from 'lucide-react';
import Navbar from '../components/Navbar';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Navbar />
      
      {/* Hero Section with Animated Gradient */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-500">
              Welcome to Insights.AI
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Transform your e-commerce data into strategic advantage. Analyze sales trends, 
              uncover hidden opportunities, and make data-driven decisions with intuitive precision.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1"
              >
                <span>Get Started</span>
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition duration-300"
              >
                <span>Watch Demo</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Decorative Element */}
        <div className="absolute -bottom-24 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-gray-900 z-10"></div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Analytics Made Simple</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Our platform provides comprehensive business intelligence tools designed specifically for e-commerce businesses.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-emerald-500 transition duration-300">
            <div className="bg-emerald-500 p-3 rounded-lg inline-block mb-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Conversational Analytics</h3>
            <p className="text-gray-300">
              Simply ask questions in natural language and get immediate insights from your data—no technical expertise required.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-emerald-500 transition duration-300">
            <div className="bg-blue-500 p-3 rounded-lg inline-block mb-4">
              <PieChart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dynamic Visualizations</h3>
            <p className="text-gray-300">
              Transform complex data into stunning, interactive charts that reveal patterns and trends at a glance.
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 p-8 rounded-xl shadow-lg border border-gray-700 hover:border-emerald-500 transition duration-300">
            <div className="bg-purple-500 p-3 rounded-lg inline-block mb-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Strategic Recommendations</h3>
            <p className="text-gray-300">
              Receive actionable insights and strategic advice to optimize inventory, pricing, and marketing campaigns.
            </p>
          </div>
        </div>
      </div>
      
      {/* Value Proposition Section */}
      <div className="bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Silver Insights?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-blue-500 rounded-lg p-2 mr-4">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Seamless Integration</h3>
                    <p className="text-gray-400">Connect with your existing e-commerce platform in minutes, not days.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500 rounded-lg p-2 mr-4">
                    <LineChart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Real-time Analysis</h3>
                    <p className="text-gray-400">Monitor performance metrics as they happen with live data dashboards.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-purple-500 rounded-lg p-2 mr-4">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Enterprise-grade Security</h3>
                    <p className="text-gray-400">Your data is protected with advanced encryption and compliance standards.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-700 to-gray-800 p-8 rounded-xl shadow-lg border border-gray-600">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to transform your business?</h3>
                <p className="text-gray-300 mb-6">
                  Join thousands of e-commerce businesses making smarter decisions with Silver Insights.
                </p>
                <Link
                  to="/signup"
                  className="inline-block bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition duration-300"
                >
                  Start Free Trial
                </Link>
                <p className="text-gray-400 mt-4 text-sm">No credit card required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            <p>© 2025 Insights.AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;