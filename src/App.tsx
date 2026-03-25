// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import JobsCollectionPage from './pages/jobs';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/jobs" element={<JobsCollectionPage />} />
            {/* 其他路由... */}
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;