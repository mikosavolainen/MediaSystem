import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import UploadMedia from './pages/UploadMedia';
import ReviewMedia from './pages/ReviewMedia';
import Reports from './pages/Reports';
import Header from './components/Header';
import "./App.css"
function App() {
  return (
    <AppProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/upload" element={<UploadMedia />} />
          <Route path="/review" element={<ReviewMedia />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
