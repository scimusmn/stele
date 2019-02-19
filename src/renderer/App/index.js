import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { Container } from 'reactstrap';
import AppRoutes from './AppRouter';

function App() {
  return (
    <Container>
      <Router>
        <AppRoutes />
      </Router>
    </Container>
  );
}

export default App;
