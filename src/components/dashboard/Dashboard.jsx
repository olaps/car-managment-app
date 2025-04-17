// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Chip
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  Build as ToolIcon,
  Notifications as NotificationIcon,
  EventAvailable as EventAvailableIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Money as MoneyIcon
} from '@mui/icons-material';
import { vehicleService } from '../../api/vehicleService';
import { maintenanceService } from '../../api/maintenanceService';
import { reminderService } from '../../api/reminderService';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';


// Modifications à apporter au fichier src/components/dashboard/Dashboard.jsx

// Ajouter cette importation en haut du fichier
import { getDefaultVehicleImage } from '../../utils/defaultImages';



// Enregistrer les composants ChartJS nécessaires
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Dans le composant, ajouter cette fonction helper
const getVehicleImage = (vehicle) => {
    if (vehicle.photoUrl) {
      return vehicle.photoUrl;
    }
    return getDefaultVehicleImage(vehicle.brand);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Charger toutes les données nécessaires
        const vehiclesResponse = await vehicleService.getAllVehicles();
        const maintenanceResponse = await maintenanceService.getAllRecords();
        const remindersResponse = await reminderService.getAllReminders();
        
        setVehicles(vehiclesResponse.data);
        setMaintenanceRecords(maintenanceResponse.data);
        setReminders(remindersResponse.data);
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculer les statistiques importantes
  const totalVehicles = vehicles.length;
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
  const pendingReminders = reminders.filter(r => !r.isCompleted).length;
  
  // Récupérer les prochains rappels (les 3 premiers non complétés)
  const upcomingReminders = reminders
    .filter(r => !r.isCompleted)
    .sort((a, b) => {
      if (a.triggerDate && b.triggerDate) {
        return new Date(a.triggerDate).getTime() - new Date(b.triggerDate).getTime();
      }
      return 0;
    })
    .slice(0, 3);

  // Récupérer les entretiens récents (les 3 derniers)
  const recentMaintenance = [...maintenanceRecords]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  // Préparer les données pour le graphique de coûts par type d'entretien
  const maintenanceByType = maintenanceRecords.reduce((acc, record) => {
    if (!acc[record.type]) {
      acc[record.type] = 0;
    }
    acc[record.type] += record.cost;
    return acc;
  }, {});

  const costChartData = {
    labels: Object.keys(maintenanceByType),
    datasets: [
      {
        label: 'Coût par type d\'entretien',
        data: Object.values(maintenanceByType),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Préparer les données pour le graphique d'entretien par véhicule
  const maintenanceByVehicle = maintenanceRecords.reduce((acc, record) => {
    if (!acc[record.vehicleId]) {
      acc[record.vehicleId] = 0;
    }
    acc[record.vehicleId] += record.cost;
    return acc;
  }, {});

  const vehicleNames = {};
  vehicles.forEach(vehicle => {
    vehicleNames[vehicle.id] = `${vehicle.brand} ${vehicle.model}`;
  });

  const vehicleChartData = {
    labels: Object.keys(maintenanceByVehicle).map(id => vehicleNames[id] || `Véhicule ${id}`),
    datasets: [
      {
        label: 'Coût par véhicule',
        data: Object.values(maintenanceByVehicle),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <Typography>Chargement du tableau de bord...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tableau de bord
      </Typography>

      {/* Statistiques principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CarIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Véhicules</Typography>
              </Box>
              <Typography variant="h4">{totalVehicles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Coût total</Typography>
              </Box>
              <Typography variant="h4">{totalMaintenanceCost.toLocaleString()} €</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ToolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Entretiens</Typography>
              </Box>
              <Typography variant="h4">{maintenanceRecords.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: pendingReminders > 0 ? 'rgba(255, 152, 0, 0.1)' : 'inherit'
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <NotificationIcon color={pendingReminders > 0 ? "warning" : "primary"} sx={{ mr: 1 }} />
                <Typography variant="h6">Rappels en attente</Typography>
              </Box>
              <Typography variant="h4">{pendingReminders}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Contenu principal */}
      <Grid container spacing={3}>
        {/* Graphiques */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Coût par type d'entretien</Typography>
                <Box sx={{ height: '300px' }}>
                  {Object.keys(maintenanceByType).length > 0 ? (
                    <Doughnut 
                      data={costChartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>Coût par véhicule</Typography>
                <Box sx={{ height: '300px' }}>
                  {Object.keys(maintenanceByVehicle).length > 0 ? (
                    <Bar 
                      data={vehicleChartData} 
                      options={{ 
                        responsive: true, 
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          }
                        }
                      }}
                    />
                  ) : (
                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">Aucune donnée disponible</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
        
        {/* Rappels et entretiens récents */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Prochains rappels
              </Typography>
              <IconButton size="small" onClick={() => navigate('/reminders')}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider />
            
            {upcomingReminders.length === 0 ? (
              <Box sx={{ py: 2 }}>
                <Typography align="center" color="text.secondary">
                  Aucun rappel en attente
                </Typography>
              </Box>
            ) : (
              <List>
                {upcomingReminders.map((reminder) => {
                  const vehicle = vehicles.find(v => v.id === reminder.vehicleId);
                  const vehicleName = vehicle 
                    ? `${vehicle.brand} ${vehicle.model}`
                    : `Véhicule ${reminder.vehicleId}`;
                    
                  return (
                    <ListItem key={reminder.id} sx={{ px: 1 }}>
                      <ListItemIcon>
                        {reminder.triggerDate && new Date(reminder.triggerDate) < new Date() ? (
                          <WarningIcon color="error" />
                        ) : (
                          <EventAvailableIcon color="primary" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={reminder.type}
                        secondary={
                          <>
                            {vehicleName}
                            {reminder.triggerDate && (
                              <> • {new Date(reminder.triggerDate).toLocaleDateString()}</>
                            )}
                            {reminder.triggerMileage && (
                              <> • {reminder.triggerMileage.toLocaleString()} km</>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button 
                startIcon={<AddIcon />}
                onClick={() => navigate('/reminders/new')}
              >
                Ajouter un rappel
              </Button>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Entretiens récents
              </Typography>
              <IconButton size="small" onClick={() => navigate('/maintenance')}>
                <MoreVertIcon />
              </IconButton>
            </Box>
            <Divider />
            
            {recentMaintenance.length === 0 ? (
              <Box sx={{ py: 2 }}>
                <Typography align="center" color="text.secondary">
                  Aucun entretien enregistré
                </Typography>
              </Box>
            ) : (
              <List>
                {recentMaintenance.map((record) => {
                  const vehicle = vehicles.find(v => v.id === record.vehicleId);
                  const vehicleName = vehicle 
                    ? `${vehicle.brand} ${vehicle.model}`
                    : `Véhicule ${record.vehicleId}`;
                    
                  return (
                    <ListItem key={record.id} sx={{ px: 1 }}>
                      <ListItemIcon>
                        <ToolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">{record.type}</Typography>
                            <Chip 
                              label={`${record.cost} €`} 
                              size="small" 
                              color="primary" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            {vehicleName} • {new Date(record.date).toLocaleDateString()}
                          </>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button 
                startIcon={<AddIcon />}
                onClick={() => navigate('/maintenance/new')}
              >
                Ajouter un entretien
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* Section pour les véhicules récents */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Mes véhicules
              </Typography>
              <Button 
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => navigate('/vehicles/new')}
              >
                Ajouter un véhicule
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {vehicles.length === 0 ? (
              <Box sx={{ py: 2 }}>
                <Typography align="center" color="text.secondary">
                  Aucun véhicule enregistré
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {vehicles.map((vehicle) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={vehicle.id}>
                    <Card>
                      <CardActionArea onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
                      <Box 
  sx={{ 
    height: 140, 
    backgroundImage: `url(${getVehicleImage(vehicle)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }} 
/>
                        <CardContent>
                          <Typography gutterBottom variant="h6" component="div" noWrap>
                            {vehicle.brand} {vehicle.model}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              {vehicle.year}
                            </Typography>
                            <Chip 
                              label={vehicle.licensePlate} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {vehicle.mileage.toLocaleString()} km
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;