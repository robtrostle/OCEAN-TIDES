import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SeeTomorrow from './components/SeeTomorrow';
import HomePage from './HomePage';
import DuttonIsland from './components/DuttonIsland';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/see-tomorrow" element={<SeeTomorrow />} />
        <Route path="/dutton-island" element={<DuttonIsland />} />
      </Routes>
    </Router>
  );
}

export default App;