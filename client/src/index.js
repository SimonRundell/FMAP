import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { loadConfig } from './components/config';

loadConfig().then(() => {
    
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
});