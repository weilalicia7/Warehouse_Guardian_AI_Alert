/**
 * Application Entry Point
 * Renders the React application
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';
import './index.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

// Create root and render app
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
