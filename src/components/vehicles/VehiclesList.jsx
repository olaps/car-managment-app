// src/components/vehicles/VehiclesList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as ToolIcon,
  Notifications as NotificationIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { vehicleService } from '../../api/vehicleService';
// Modifications à apporter au fichier src/components/vehicles/VehiclesList.jsx

// Ajouter cette importation en haut du fichier
import { getDefaultVehicleImage } from '../../utils/defaultImages';




const VehiclesList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, vehicleId: null });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getAllVehicles();
        setVehicles(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des véhicules');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleDeleteClick = (vehicleId) => {
    setDeleteDialog({ open: true, vehicleId });
  };

  // Dans le composant, ajouter cette fonction helper
const getVehicleImage = (vehicle) => {
  if (vehicle.photoUrl) {
    return vehicle.photoUrl;
  }
  return getDefaultVehicleImage(vehicle.brand);
};

  const handleDeleteConfirm = async () => {
    try {
      await vehicleService.deleteVehicle(deleteDialog.vehicleId);
      setVehicles(vehicles.filter(v => v.id !== deleteDialog.vehicleId));
      setDeleteDialog({ open: false, vehicleId: null });
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      // Gérer l'erreur
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, vehicleId: null });
  };

  if (loading) return <Typography>Chargement des véhicules...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Mes Véhicules
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/vehicles/new')}
        >
          Ajouter un véhicule
        </Button>
      </Box>

      {vehicles.length === 0 ? (
        <Typography>Aucun véhicule enregistré. Ajoutez votre premier véhicule !</Typography>
      ) : (
        <Grid container spacing={3}>
          {vehicles.map((vehicle) => (
            <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
              <Card>
              <CardMedia
              component="img"
              height="140"
              image={getVehicleImage(vehicle)}
              alt={`${vehicle.brand} ${vehicle.model}`}
              />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {vehicle.brand} {vehicle.model}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {vehicle.year}
                    </Typography>
                    <Chip 
                      label={vehicle.licensePlate} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Kilométrage: {vehicle.mileage.toLocaleString()} km
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton 
                    size="small" 
                    onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                    aria-label="modifier"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/vehicles/${vehicle.id}/maintenance`)}
                    aria-label="entretien"
                  >
                    <ToolIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={() => navigate(`/vehicles/${vehicle.id}/reminders`)}
                    aria-label="rappels"
                  >
                    <NotificationIcon />
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteClick(vehicle.id)}
                    aria-label="supprimer"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VehiclesList;

