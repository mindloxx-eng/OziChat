import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './LandingApp';

const root = document.getElementById('landing-root');
if (!root) throw new Error('Landing root missing');

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
