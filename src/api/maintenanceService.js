  import api from './apiService';

export const maintenanceService = {
  getAllRecords: () => api.get('/maintenance'),
  getRecordsByVehicle: (vehicleId) => api.get(`/vehicles/${vehicleId}/maintenance`),
  createRecord: (record) => api.post('/maintenance', record)
};