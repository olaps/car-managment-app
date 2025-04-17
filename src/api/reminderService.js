import api from './apiService';

export const reminderService = {
  getAllReminders: () => api.get('/reminders'),
  getRemindersByVehicle: (vehicleId) => api.get(`/vehicles/${vehicleId}/reminders`),
  createReminder: (reminder) => api.post('/reminders', reminder),
  updateReminder: (id, reminder) => api.put(`/reminders/${id}`, reminder)
};