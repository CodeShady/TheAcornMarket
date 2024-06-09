import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import App from './App';

const useStrictMode = false;
const root = ReactDOM.createRoot(document.getElementById('root'));

if (useStrictMode) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(
    <App />
  );
}