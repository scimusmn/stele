import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Container } from 'reactstrap';
import AppRoutes from './AppRouter';
import '../styles/theme.css';

function App() {
  return (
    <Container fluid className="p-0">
      <Router>
        <AppRoutes />
      </Router>
    </Container>
  );
}

export default App;
