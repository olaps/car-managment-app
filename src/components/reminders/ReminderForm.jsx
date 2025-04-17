// src/components/reminders/ReminderForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { reminderService } from '../../api/reminderService';
import { vehicleService } from '../../api/vehicleService';
import { format, addMonths } from 'date-fns';

const ReminderForm = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminderType, setReminderType] = useState('date'); // 'date', 'mileage', or 'both'

  const validationSchema = Yup.object({
    vehicleId: Yup.number().required('Le véhicule est requis'),
    type: Yup.string().required('Le type de rappel est requis'),
    triggerDate: Yup.date().when('reminderType', {
      is: (type) => type === 'date' || type === 'both',
      then: Yup.date().required('La date de rappel est requise'),
      otherwise: Yup.date().nullable()
    }),
    triggerMileage: Yup.number().when('reminderType', {
      is: (type) => type === 'mileage' || type === 'both',
      then: Yup.number().required('Le kilométrage de rappel est requis').min(0, 'Le kilométrage doit être positif'),
      otherwise: Yup.number().nullable()
    })
  });

  const formik = useFormik({
    initialValues: {
      vehicleId: vehicleId ? parseInt(vehicleId) : '',
      type: '',
      triggerDate: format(addMonths(new Date(), 6), 'yyyy-MM-dd'), // Par défaut dans 6 mois
      triggerMileage: null,
      isCompleted: false,
      reminderType: 'date' // champ supplémentaire pour gérer le type de rappel
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Ajuster les valeurs en fonction du type de rappel
        const reminderData = {
          ...values,
          triggerDate: reminderType === 'mileage' ? null : values.triggerDate,
          triggerMileage: reminderType === 'date' ? null : values.triggerMileage
        };
        
        // Supprimer le champ reminderType qui n'est pas attendu par l'API
        delete reminderData.reminderType;
        
        await reminderService.createReminder(reminderData);
        navigate(vehicleId ? `/vehicles/${vehicleId}` : '/reminders');
      } catch (err) {
        setError('Erreur lors de l\'enregistrement du rappel');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await vehicleService.getAllVehicles();
        setVehicles(response.data);
        
        // Si un vehicleId est fourni, mettre à jour le formulaire
        if (vehicleId) {
          const vehicle = response.data.find(v => v.id === parseInt(vehicleId));
          if (vehicle) {
            formik.setFieldValue('triggerMileage', vehicle.mileage + 10000); // +10000 km par défaut
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

  // Mettre à jour le type de rappel
  const handleReminderTypeChange = (event) => {
    const newType = event.target.value;
    setReminderType(newType);
    formik.setFieldValue('reminderType', newType);
  };

  if (loading) return <Typography>Chargement des données...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton 
          onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}` : '/reminders')} 
          sx={{ mr: 1 }}
        >
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          Ajouter un rappel
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
            <Grid item xs={12} md={6}>
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
                {formik.touched.vehicleId && formik.errors.vehicleId && (
                  <FormHelperText error>{formik.errors.vehicleId}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type de rappel</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  label="Type de rappel"
                >
                  <MenuItem value="Vidange">Vidange</MenuItem>
                  <MenuItem value="Révision">Révision</MenuItem>
                  <MenuItem value="Pneumatiques">Pneumatiques</MenuItem>
                  <MenuItem value="Freins">Freins</MenuItem>
                  <MenuItem value="Batterie">Batterie</MenuItem>
                  <MenuItem value="Contrôle technique">Contrôle technique</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText error>{formik.errors.type}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Type de déclenchement
                </Typography>
                <RadioGroup
                  row
                  aria-label="reminder-type"
                  name="reminderType"
                  value={reminderType}
                  onChange={handleReminderTypeChange}
                >
                  <FormControlLabel value="date" control={<Radio />} label="Par date" />
                  <FormControlLabel value="mileage" control={<Radio />} label="Par kilométrage" />
                  <FormControlLabel value="both" control={<Radio />} label="Les deux" />
                </RadioGroup>
              </FormControl>
            </Grid>
            
            {(reminderType === 'date' || reminderType === 'both') && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="triggerDate"
                  name="triggerDate"
                  label="Date de rappel"
                  type="date"
                  value={formik.values.triggerDate}
                  onChange={formik.handleChange}
                  error={formik.touched.triggerDate && Boolean(formik.errors.triggerDate)}
                  helperText={formik.touched.triggerDate && formik.errors.triggerDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}
            
            {(reminderType === 'mileage' || reminderType === 'both') && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="triggerMileage"
                  name="triggerMileage"
                  label="Kilométrage de rappel"
                  type="number"
                  value={formik.values.triggerMileage}
                  onChange={formik.handleChange}
                  error={formik.touched.triggerMileage && Boolean(formik.errors.triggerMileage)}
                  helperText={formik.touched.triggerMileage && formik.errors.triggerMileage}
                />
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}` : '/reminders')}
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

export default ReminderForm;