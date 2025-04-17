// src/components/reminders/RemindersList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { reminderService } from '../../api/reminderService';
import { vehicleService } from '../../api/vehicleService';

const RemindersList = () => {
  const [reminders, setReminders] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les rappels
        const remindersResponse = await reminderService.getAllReminders();
        setReminders(remindersResponse.data);
        
        // Récupérer tous les véhicules pour afficher leurs noms
        const vehiclesResponse = await vehicleService.getAllVehicles();
        const vehiclesMap = {};
        vehiclesResponse.data.forEach(vehicle => {
          vehiclesMap[vehicle.id] = `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`;
        });
        setVehicles(vehiclesMap);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleReminder = async (id, isCompleted) => {
    try {
      await reminderService.updateReminder(id, { isCompleted: !isCompleted });
      setReminders(reminders.map(reminder => 
        reminder.id === id ? { ...reminder, isCompleted: !isCompleted } : reminder
      ));
    } catch (err) {
      console.error('Erreur lors de la mise à jour du rappel:', err);
    }
  };

  if (loading) return <Typography>Chargement des données...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Filtrer les rappels en fonction de showCompleted
  const filteredReminders = showCompleted 
    ? reminders 
    : reminders.filter(reminder => !reminder.isCompleted);

  // Trier les rappels: à faire d'abord, puis par date
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    // D'abord par statut (non terminé en premier)
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    
    // Ensuite par date (plus proche en premier)
    if (a.triggerDate && b.triggerDate) {
      return new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime();
    }
    
    // Si l'un a une date et l'autre non, celui avec date en premier
    if (a.triggerDate) return -1;
    if (b.triggerDate) return 1;
    
    // Sinon par kilométrage
    return (a.triggerMileage || 0) - (b.triggerMileage || 0);
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Rappels d'entretien
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/reminders/new')}
        >
          Ajouter un rappel
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              color="primary"
            />
          }
          label="Afficher les rappels effectués"
        />
      </Box>

      {filteredReminders.length === 0 ? (
        <Typography>
          {showCompleted 
            ? "Aucun rappel enregistré." 
            : "Aucun rappel en attente. Tous vos entretiens sont à jour !"}
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Véhicule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Kilométrage</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedReminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell>{vehicles[reminder.vehicleId] || 'Inconnu'}</TableCell>
                  <TableCell>{reminder.type}</TableCell>
                  <TableCell>
                    {reminder.triggerDate 
                      ? new Date(reminder.triggerDate).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {reminder.triggerMileage 
                      ? `${reminder.triggerMileage.toLocaleString()} km`
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={reminder.isCompleted ? "Effectué" : "À faire"} 
                      color={reminder.isCompleted ? "success" : "warning"} 
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      color={reminder.isCompleted ? "default" : "success"}
                      onClick={() => handleToggleReminder(reminder.id, reminder.isCompleted)}
                      sx={{ mr: 1 }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/vehicles/${reminder.vehicleId}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RemindersList;

