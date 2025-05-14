import { Link } from 'react-router-dom';

function Onboarding() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-4xl font-bold text-blue-300 mb-4">
          Welcome to Insights.AI
        </h1>
        <p className="text-gray-300 mb-6">
          Unlock powerful insights for your e-commerce business with our AI-driven analytics tool. Ask questions in natural language, and get detailed answers, SQL queries, and visualizations to help you make data-driven decisions. Whether you're analyzing top clients, sales trends, or product performance, we've got you covered.
        </p>
        <Link
          to="/dashboard"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}

export default Onboarding;