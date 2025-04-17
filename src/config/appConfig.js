// src/config/appConfig.js

/**
 * Configuration globale de l'application
 * 
 * Ce fichier contient les paramètres de configuration pour toute l'application,
 * y compris le mode API (mock ou backend réel)
 */

const appConfig = {
    // Utiliser l'API mockée (true) ou l'API réelle (false)
    useMockApi: true,
    
    // URL de base de l'API réelle (utilisée seulement si useMockApi est false)
    apiBaseUrl: 'https://api.autocare.example.com/api',
    
    // Délai simulé pour les réponses mockées (en ms)
    mockDelay: 300,
    
    // Configuration des timeouts API
    apiTimeout: 10000, // 10 secondes
    
    // Activer les logs détaillés des appels API
    debugApiCalls: false,
    
    // Version de l'application
    appVersion: '1.0.0',
  };
  
  export default appConfig;