// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
//import api from '../api/mock/axiosMock';
import api from './../api/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifier si un token existe dans le localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Simuler la récupération du profil utilisateur
      api.get('/user/profile')
        .then(response => {
          setUser(response.data);
        })
        .catch(err => {
          console.error('Erreur lors de la récupération du profil:', err);
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Stocker le token dans le localStorage
      localStorage.setItem('authToken', token);
      
      // Mettre à jour l'état utilisateur
      setUser(user);
      return user;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updatePreferences = async (preferences) => {
    try {
      const response = await api.put('/user/preferences', preferences);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour des préférences');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    updatePreferences
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};