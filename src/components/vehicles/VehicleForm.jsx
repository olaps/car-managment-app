// src/components/vehicles/VehicleForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  Card,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider
} from '@mui/material';
import {
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { vehicleService } from '../../api/vehicleService';

const VehicleForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);
  
  const validationSchema = Yup.object({
    brand: Yup.string().required('La marque est requise'),
    model: Yup.string().required('Le modèle est requis'),
    year: Yup.number()
      .required('L\'année est requise')
      .min(1950, 'L\'année doit être postérieure à 1950')
      .max(new Date().getFullYear(), `L'année ne peut pas dépasser ${new Date().getFullYear()}`),
    licensePlate: Yup.string().required('L\'immatriculation est requise'),
    mileage: Yup.number()
      .required('Le kilométrage est requis')
      .min(0, 'Le kilométrage doit être positif')
  });

  const formik = useFormik({
    initialValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      mileage: 0,
      photoUrl: '',
      documents: []
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEditing) {
          await vehicleService.updateVehicle(id, values);
        } else {
          await vehicleService.createVehicle(values);
        }
        navigate('/vehicles');
      } catch (err) {
        setError('Erreur lors de l\'enregistrement du véhicule');
        console.error(err);
      }
    }
  });

  useEffect(() => {
    if (isEditing) {
      const fetchVehicle = async () => {
        try {
          const response = await vehicleService.getVehicleById(id);
          formik.setValues(response.data);
        } catch (err) {
          setError('Erreur lors du chargement du véhicule');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchVehicle();
    }
  }, [id, isEditing]);

  const handleDocumentUpload = () => {
    // Simulation d'ajout de document
    const newDocument = {
      id: Date.now(),
      name: `Document ${formik.values.documents.length + 1}`,
      url: `/documents/document-${Date.now()}.pdf`
    };
    
    formik.setFieldValue('documents', [...formik.values.documents, newDocument]);
  };

  const handleDocumentDelete = (docId) => {
    formik.setFieldValue(
      'documents',
      formik.values.documents.filter(doc => doc.id !== docId)
    );
  };

  const handlePhotoUpload = () => {
    // Simulation d'upload de photo
    const photoUrl = `/images/car-${Date.now()}.jpg`;
    formik.setFieldValue('photoUrl', photoUrl);
  };

  if (loading) return <Typography>Chargement du véhicule...</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/vehicles')} sx={{ mr: 1 }}>
          <BackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
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
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="brand"
                    name="brand"
                    label="Marque"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    error={formik.touched.brand && Boolean(formik.errors.brand)}
                    helperText={formik.touched.brand && formik.errors.brand}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="model"
                    name="model"
                    label="Modèle"
                    value={formik.values.model}
                    onChange={formik.handleChange}
                    error={formik.touched.model && Boolean(formik.errors.model)}
                    helperText={formik.touched.model && formik.errors.model}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="year"
                    name="year"
                    label="Année"
                    type="number"
                    value={formik.values.year}
                    onChange={formik.handleChange}
                    error={formik.touched.year && Boolean(formik.errors.year)}
                    helperText={formik.touched.year && formik.errors.year}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="licensePlate"
                    name="licensePlate"
                    label="Immatriculation"
                    value={formik.values.licensePlate}
                    onChange={formik.handleChange}
                    error={formik.touched.licensePlate && Boolean(formik.errors.licensePlate)}
                    helperText={formik.touched.licensePlate && formik.errors.licensePlate}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
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
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={formik.values.photoUrl || "/images/default-car.jpg"}
                  alt="Photo du véhicule"
                />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    startIcon={<PhotoIcon />}
                    onClick={handlePhotoUpload}
                  >
                    {formik.values.photoUrl ? 'Changer la photo' : 'Ajouter une photo'}
                  </Button>
                </Box>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Documents
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                {formik.values.documents.length === 0 ? (
                  <ListItem>
                    <ListItemText primary="Aucun document enregistré" />
                  </ListItem>
                ) : (
                  formik.values.documents.map((doc) => (
                    <ListItem
                      key={doc.id}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleDocumentDelete(doc.id)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={doc.name}
                        secondary={doc.url}
                      />
                    </ListItem>
                  ))
                )}
              </List>
              
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={handleDocumentUpload}>
                  Ajouter un document
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/vehicles')}
                sx={{ mr: 2 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
              >
                {isEditing ? 'Enregistrer les modifications' : 'Ajouter le véhicule'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default VehicleForm;