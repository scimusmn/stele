//
// React application root
//
// This is the start of our single "page" React app.
// The React app drives the internal web application.
// Electron runs the application wrapper that view this web application.
//
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
