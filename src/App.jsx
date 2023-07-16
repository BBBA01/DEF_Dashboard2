import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard/Dashboard';

const App = () => {
  
  

  
  return (
    <div id="dashboard">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Dashboard />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
