import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SeeTomorrow from './components/SeeTomorrow';
import HomePage from './HomePage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/see-tomorrow" element={<SeeTomorrow />} />
      </Routes>
    </Router>
  );
}

export default App;