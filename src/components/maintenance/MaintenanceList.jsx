// src/components/maintenance/MaintenanceList.jsx
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
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { maintenanceService } from '../../api/maintenanceService';
import { vehicleService } from '../../api/vehicleService';

const MaintenanceList = () => {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer tous les entretiens
        const recordsResponse = await maintenanceService.getAllRecords();
        setRecords(recordsResponse.data);
        
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

  if (loading) return <Typography>Chargement des données...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  // Trier les records par date (plus récent en premier)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Historique d'entretien
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/maintenance/new')}
        >
          Ajouter un entretien
        </Button>
      </Box>

      {records.length === 0 ? (
        <Typography>Aucun entretien enregistré.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Véhicule</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Kilométrage</TableCell>
                <TableCell>Coût</TableCell>
                <TableCell>Garage</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{vehicles[record.vehicleId] || 'Inconnu'}</TableCell>
                  <TableCell>{record.type}</TableCell>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.mileage.toLocaleString()} km</TableCell>
                  <TableCell>
                    <Chip 
                      label={`${record.cost} €`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{record.location}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
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

export default MaintenanceList;
