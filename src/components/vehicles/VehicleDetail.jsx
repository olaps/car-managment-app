// src/components/vehicles/VehicleDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Build as ToolIcon,
  Notifications as NotificationIcon,
  Description as DocumentIcon,
  Event as EventIcon,
  Speed as SpeedIcon,
  Euro as EuroIcon
} from '@mui/icons-material';
import { vehicleService } from '../../api/vehicleService';
import { maintenanceService } from '../../api/maintenanceService';
import { reminderService } from '../../api/reminderService';

// Ajouter cette importation en haut du fichier
import { getDefaultVehicleImage } from '../../utils/defaultImages';



//import api from '../../api/mock/axiosMock';
import api from './../../api/apiService';



// Composant TabPanel pour gérer le contenu des onglets
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vehicle-tabpanel-${index}`}
      aria-labelledby={`vehicle-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
// Dans le composant, ajouter cette fonction helper
const getVehicleImage = (vehicle) => {
    if (vehicle.photoUrl) {
      return vehicle.photoUrl;
    }
    return getDefaultVehicleImage(vehicle.brand);
  };
  const getMaintenanceByVehicle = async (vehicleId) => {
    try {
      // Utiliser directement l'API mock
      const response = await api.get(`/vehicles/${vehicleId}/maintenance`);
      return response;
    } catch (error) {
      console.error("Erreur:", error);
      return { data: [] };
    }
  };

  const getRemindersByVehicle = async (vehicleId) => {
    try {
      // Utiliser directement l'API mock
      const response = await api.get(`/vehicles/${vehicleId}/reminders`);
      return response;
    } catch (error) {
      console.error("Erreur de rappels:", error);
      return { data: [] }; // Retourner un tableau vide en cas d'erreur
    }
  };
  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        // Récupérer les données du véhicule
        const vehicleResponse = await vehicleService.getVehicleById(id);
        setVehicle(vehicleResponse.data);
        
        // Récupérer l'historique d'entretien
      //  const maintenanceResponse = await maintenanceService.getRecordsByVehicle(id);
      const maintenanceResponse = await getMaintenanceByVehicle(id);

        setMaintenanceRecords(maintenanceResponse.data);
        
        // Récupérer les rappels
      // const remindersResponse = await reminderService.getRemindersByVehicle(id);
       const remindersResponse = await getRemindersByVehicle(id);

       setReminders(remindersResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données du véhicule');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [id]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) return <Typography>Chargement des données...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!vehicle) return <Typography>Véhicule non trouvé</Typography>;

  // Calculer le total des coûts d'entretien
  const totalMaintenanceCost = maintenanceRecords.reduce((total, record) => total + record.cost, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {vehicle.brand} {vehicle.model}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/vehicles/${id}/edit`)}
          sx={{ mr: 1 }}
        >
          Modifier
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
          <CardMedia
            component="img"
            height="200"
            image={getVehicleImage(vehicle)}
             alt={`${vehicle.brand} ${vehicle.model}`}
            />
            <Box sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                {vehicle.brand} {vehicle.model} ({vehicle.year})
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Immatriculation:</Typography>
                <Chip label={vehicle.licensePlate} color="primary" variant="outlined" />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">Kilométrage:</Typography>
                <Typography variant="body1" fontWeight="bold">
                  {vehicle.mileage.toLocaleString()} km
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1">Coût total d'entretien:</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">
                  {totalMaintenanceCost.toLocaleString()} €
                </Typography>
              </Box>
            </Box>
          </Card>

          <Paper sx={{ mt: 3, p: 2 }}>
            <Typography variant="h6" gutterBottom>Documents</Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {vehicle.documents.length === 0 ? (
                <ListItem>
                  <ListItemText primary="Aucun document enregistré" />
                </ListItem>
              ) : (
                vehicle.documents.map((doc) => (
                  <ListItem key={doc.id} button>
                    <ListItemIcon>
                      <DocumentIcon />
                    </ListItemIcon>
                    <ListItemText primary={doc.name} />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
            >
              <Tab icon={<ToolIcon />} label="Entretiens" />
              <Tab icon={<NotificationIcon />} label="Rappels" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Historique d'entretien</Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/vehicles/${id}/maintenance/new`)}
                >
                  Ajouter un entretien
                </Button>
              </Box>

              {maintenanceRecords.length === 0 ? (
                <Typography>Aucun historique d'entretien enregistré.</Typography>
              ) : (
                <List>
                  {maintenanceRecords.map((record) => (
                    <Paper key={record.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{record.type}</Typography>
                        <Chip label={`${record.cost} €`} color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">{new Date(record.date).toLocaleDateString()}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">{record.mileage.toLocaleString()} km</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EuroIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">{record.cost} €</Typography>
                        </Box>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {record.location}
                      </Typography>
                      {record.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {record.notes}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </List>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Rappels programmés</Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate(`/vehicles/${id}/reminders/new`)}
                >
                  Ajouter un rappel
                </Button>
              </Box>

              {reminders.length === 0 ? (
                <Typography>Aucun rappel programmé.</Typography>
              ) : (
                <List>
                  {reminders.map((reminder) => (
                    <Paper key={reminder.id} sx={{ mb: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6">{reminder.type}</Typography>
                        <Chip 
                          label={reminder.isCompleted ? "Effectué" : "À faire"} 
                          color={reminder.isCompleted ? "success" : "warning"} 
                        />
                      </Box>
                      {reminder.triggerDate && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EventIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {new Date(reminder.triggerDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                      {reminder.triggerMileage && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2">
                            {reminder.triggerMileage.toLocaleString()} km
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  ))}
                </List>
              )}
            </TabPanel>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VehicleDetail;