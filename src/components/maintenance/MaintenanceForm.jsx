
// src/components/maintenance/MaintenanceForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Save as SaveIcon,
  PhotoCamera as PhotoIcon
} from '@mui/icons-material';
import { maintenanceService } from '../../api/maintenanceService';
import { vehicleService } from '../../api/vehicleService';
import { format } from 'date-fns';

const MaintenanceForm = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validationSchema = Yup.object({
    vehicleId: Yup.number().required('Le véhicule est requis'),
    type: Yup.string().required('Le type d\'intervention est requis'),
    date: Yup.date().required('La date est requise'),
    mileage: Yup.number()
      .required('Le kilométrage est requis')
      .min(0, 'Le kilométrage doit être positif'),
    cost: Yup.number()
      .required('Le coût est requis')
      .min(0, 'Le coût doit être positif'),
    location: Yup.string().required('Le lieu d\'intervention est requis')
  });

  const formik = useFormik({
    initialValues: {
      vehicleId: vehicleId ? parseInt(vehicleId) : '',
      type: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      mileage: 0,
      cost: 0,
      invoiceUrl: '',
      notes: '',
      location: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await maintenanceService.createRecord(values);
        navigate(vehicleId ? `/vehicles/${vehicleId}` : '/maintenance');
      } catch (err) {
        setError('Erreur lors de l\'enregistrement de l\'intervention');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getAllVehicles();
        setVehicles(response.data);
        
        // Si un vehicleId est fourni et que nous avons récupéré ce véhicule,
        // mettre à jour le kilométrage automatiquement
        if (vehicleId) {
          const vehicle = response.data.find(v => v.id === parseInt(vehicleId));
          if (vehicle) {
            formik.setFieldValue('mileage', vehicle.mileage);
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement des véhicules');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [vehicleId]);

  const handleInvoiceUpload = () => {
    // Simulation d'upload de facture
    const invoiceUrl = `/invoices/invoice-${Date.now()}.pdf`;
    formik.setFieldValue('invoiceUrl', invoiceUrl);
  };

  if (loading) return <Typography>Chargement des données...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}` : '/maintenance')} 
          sx={{ mr: 1 }}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Ajouter un entretien
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="vehicle-label">Véhicule</InputLabel>
                <Select
                  labelId="vehicle-label"
                  id="vehicleId"
                  name="vehicleId"
                  value={formik.values.vehicleId}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicleId && Boolean(formik.errors.vehicleId)}
                  label="Véhicule"
                  disabled={Boolean(vehicleId)}
                >
                  {vehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type d'intervention</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  label="Type d'intervention"
                >
                  <MenuItem value="Vidange">Vidange</MenuItem>
                  <MenuItem value="Révision">Révision</MenuItem>
                  <MenuItem value="Pneumatiques">Pneumatiques</MenuItem>
                  <MenuItem value="Freins">Freins</MenuItem>
                  <MenuItem value="Batterie">Batterie</MenuItem>
                  <MenuItem value="Contrôle technique">Contrôle technique</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date"
                name="date"
                label="Date"
                type="date"
                value={formik.values.date}
                onChange={formik.handleChange}
                error={formik.touched.date && Boolean(formik.errors.date)}
                helperText={formik.touched.date && formik.errors.date}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="mileage"
                name="mileage"
                label="Kilométrage"
                type="number"
                value={formik.values.mileage}
                onChange={formik.handleChange}
                error={formik.touched.mileage && Boolean(formik.errors.mileage)}
                helperText={formik.touched.mileage && formik.errors.mileage}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="cost"
                name="cost"
                label="Coût (€)"
                type="number"
                value={formik.values.cost}
                onChange={formik.handleChange}
                error={formik.touched.cost && Boolean(formik.errors.cost)}
                helperText={formik.touched.cost && formik.errors.cost}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="location"
                name="location"
                label="Garage / Lieu d'intervention"
                value={formik.values.location}
                onChange={formik.handleChange}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  {formik.values.invoiceUrl ? 'Facture ajoutée' : 'Ajouter une facture (optionnel)'}
                </Typography>
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoIcon />}
                  onClick={handleInvoiceUpload}
                >
                  {formik.values.invoiceUrl ? 'Changer' : 'Ajouter'}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                name="notes"
                label="Notes et commentaires"
                multiline
                rows={4}
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}` : '/maintenance')}
                sx={{ mr: 2 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                Enregistrer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default MaintenanceForm;