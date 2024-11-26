import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Adjust the path if necessary
import { BrowserRouter } from 'react-router-dom';

// Root rendering with ReactDOM.createRoot (React 18+)
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
