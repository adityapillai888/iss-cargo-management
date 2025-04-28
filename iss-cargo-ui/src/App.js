
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Placement from './components/Placement';
import WasteManagement from './components/WasteManagement';
import Retrieval from './components/Retrieval';
import Logs from './components/Logs';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/placement" element={<Placement />} />
        <Route path="/waste-management" element={<WasteManagement />} />
        <Route path="/retrieval" element={<Retrieval />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </Router>
  );
}

export default App;


