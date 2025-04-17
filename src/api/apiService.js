// src/api/apiService.js

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import appConfig from '../config/appConfig';
import setupMocks from './mock/setupMocks';


// Créer l'instance Axios de base
const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  timeout: appConfig.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Si le mode mock est activé, configurer le mock adapter
if (appConfig.useMockApi) {
  console.log('🔧 Mode API : Mock (simulation)');
  const mock = new MockAdapter(api, { 
    delayResponse: appConfig.mockDelay,
    onNoMatch: 'passthrough'
  });
  setupMocks(mock);
} else {
  console.log('🔧 Mode API : Backend réel');
  
  // Intercepteur pour ajouter le token d'authentification
  api.interceptors.request.use(
    config => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
  
  // Intercepteur pour gérer les erreurs d'API
  api.interceptors.response.use(
    response => response,
    error => {
      // Gérer les erreurs d'API (401, 403, etc.)
      if (error.response) {
        // Le serveur a répondu avec un code d'erreur
        if (error.response.status === 401) {
          // Non authentifié, rediriger vers la page de connexion
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );
}

// Activer les logs détaillés si debugApiCalls est activé
if (appConfig.debugApiCalls) {
  api.interceptors.request.use(request => {
    console.log('🌐 API Request:', request);
    return request;
  });
  
  api.interceptors.response.use(
    response => {
      console.log('🌐 API Response:', response);
      return response;
    },
    error => {
      console.error('🌐 API Error:', error);
      return Promise.reject(error);
    }
  );
}

export default api;