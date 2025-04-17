// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Composants
import LoginForm from './components/auth/LoginForm';
import MainLayout from './components/ui/MainLayout';
import Dashboard from './components/dashboard/Dashboard';
import VehiclesList from './components/vehicles/VehiclesList';
import VehicleForm from './components/vehicles/VehicleForm';
import VehicleDetail from './components/vehicles/VehicleDetail';
import MaintenanceList from './components/maintenance/MaintenanceList';
import MaintenanceForm from './components/maintenance/MaintenanceForm';
import RemindersList from './components/reminders/RemindersList';
import ReminderForm from './components/reminders/ReminderForm';

// Définition du thème
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    }
  },
});

// Composant de protection des routes
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              {/* Routes pour les véhicules */}
              <Route path="vehicles" element={<VehiclesList />} />
              <Route path="vehicles/new" element={<VehicleForm />} />
              <Route path="vehicles/:id" element={<VehicleDetail />} />
              <Route path="vehicles/:id/edit" element={<VehicleForm />} />
              <Route path="vehicles/:vehicleId/maintenance/new" element={<MaintenanceForm />} />
              <Route path="vehicles/:vehicleId/reminders/new" element={<ReminderForm />} />
              
              {/* Routes pour les entretiens */}
              <Route path="maintenance" element={<MaintenanceList />} />
              <Route path="maintenance/new" element={<MaintenanceForm />} />
              
              {/* Routes pour les rappels */}
              <Route path="reminders" element={<RemindersList />} />
              <Route path="reminders/new" element={<ReminderForm />} />
            </Route>
            
            {/* Redirection par défaut */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;