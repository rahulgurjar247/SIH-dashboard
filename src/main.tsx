import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './app/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

