import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {useState} from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppNavbar from './components/Navbar';
import TaskDashboard from './components/TaskDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';


const App = () => {
  const [priorityFilter, setPriorityFilter] = useState('all');

  // A protected route component that checks for authentication
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children; // If authenticated, render the children (protected page)
  };

  const handleFilterChange = (e) => {
    setPriorityFilter(e.target.value); // Update filter based on dropdown
  };
  return (
    <Router>
      <AppNavbar priorityFilter={priorityFilter} handleFilterChange={handleFilterChange}/>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <TaskDashboard priorityFilter={priorityFilter}/>
          </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
};

export default App;
