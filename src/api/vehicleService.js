import api from './apiService';

export const vehicleService = {
  getAllVehicles: () => api.get('/vehicles'),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  createVehicle: (vehicle) => api.post('/vehicles', vehicle),
  updateVehicle: (id, vehicle) => api.put(`/vehicles/${id}`, vehicle),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`)
};