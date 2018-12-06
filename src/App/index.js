import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRouter';
import 'bootstrap/dist/css/bootstrap.css';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;

