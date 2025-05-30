import { BrowserRouter, Routes, Route } from 'react-router-dom';
     import Home from './Pages/Home';
     import Dashboard from './Pages/Dashboard';
     import NotFound from './Pages/NotFound';
     import Demo from './Pages/Demo';
     import Signup from './Pages/Signup';
     import './App.css';

     function App() {
       return (
         <BrowserRouter>
           <Routes>
             <Route path="/" element={<Home />} />
             <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/demo" element={<Demo />} />
             <Route path="/signup" element={<Signup />} />
             <Route path="*" element={<NotFound />} />
           </Routes>
         </BrowserRouter>
       );
     }

     export default App;