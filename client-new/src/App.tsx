import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;