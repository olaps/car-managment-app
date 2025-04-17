// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Importation nécessaire pour utiliser le mock d'Axios
// Ceci est requis uniquement en mode développement mocké
// En production, on utiliserait simplement 'import App from './App';'
import './api/mock/setupMocks';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
