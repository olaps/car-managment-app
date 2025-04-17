// src/api/mock/axiosMock.js
import MockAdapter from 'axios-mock-adapter';
import { getDefaultVehicleImage } from '../../utils/defaultImages';

import api from './../apiService';

// Créer une instance du MockAdapter
const mock = new MockAdapter(api, { delayResponse: 500 });

// Données mockées
const mockVehicles = [
    {
      id: 1,
      brand: 'Renault',
      model: 'Clio',
      year: 2020,
      licensePlate: 'AB-123-CD',
      mileage: 45000,
      photoUrl: getDefaultVehicleImage('Renault'),
      documents: [
        { id: 1, name: 'Carte grise', url: '/documents/cg-clio.pdf' },
        { id: 2, name: 'Assurance', url: '/documents/assurance-clio.pdf' }
      ]
    },
    {
      id: 2,
      brand: 'Peugeot',
      model: '308',
      year: 2019,
      licensePlate: 'EF-456-GH',
      mileage: 62000,
      photoUrl: getDefaultVehicleImage('Peugeot'),
      documents: [
        { id: 3, name: 'Carte grise', url: '/documents/cg-308.pdf' },
        { id: 4, name: 'Assurance', url: '/documents/assurance-308.pdf' }
      ]
    },
    {
      id: 3,
      brand: 'Volkswagen',
      model: 'Golf',
      year: 2021,
      licensePlate: 'IJ-789-KL',
      mileage: 28000,
      photoUrl: getDefaultVehicleImage('Volkswagen'),
      documents: [
        { id: 5, name: 'Carte grise', url: '/documents/cg-golf.pdf' },
        { id: 6, name: 'Assurance', url: '/documents/assurance-golf.pdf' }
      ]
    },
    {
      id: 4,
      brand: 'Toyota',
      model: 'Yaris',
      year: 2018,
      licensePlate: 'MN-012-OP',
      mileage: 75000,
      photoUrl: getDefaultVehicleImage('Toyota'),
      documents: [
        { id: 7, name: 'Carte grise', url: '/documents/cg-yaris.pdf' },
        { id: 8, name: 'Assurance', url: '/documents/assurance-yaris.pdf' }
      ]
    }
  ];

const mockMaintenanceRecords = [
  {
    id: 1,
    vehicleId: 1,
    type: 'Vidange',
    date: '2023-12-15',
    mileage: 40000,
    cost: 120,
    invoiceUrl: '/invoices/vidange-clio.pdf',
    notes: 'Huile synthétique 5W40',
    location: 'Garage Central'
  },
  {
    id: 2,
    vehicleId: 1,
    type: 'Révision',
    date: '2023-06-20',
    mileage: 35000,
    cost: 350,
    invoiceUrl: '/invoices/revision-clio.pdf',
    notes: 'Remplacement filtres et bougies',
    location: 'Concession Renault'
  },
  {
    id: 3,
    vehicleId: 2,
    type: 'Pneumatiques',
    date: '2024-01-10',
    mileage: 60000,
    cost: 480,
    invoiceUrl: '/invoices/pneus-308.pdf',
    notes: 'Michelin 4 saisons',
    location: 'Euromaster'
  }
];

const mockReminders = [
  {
    id: 1,
    vehicleId: 1,
    type: 'Vidange',
    triggerDate: '2024-06-15',
    triggerMileage: 50000,
    isCompleted: false
  },
  {
    id: 2,
    vehicleId: 2,
    type: 'Contrôle technique',
    triggerDate: '2024-05-20',
    triggerMileage: null,
    isCompleted: false
  }
];

const mockUser = {
  id: 1,
  email: 'user@example.com',
  name: 'Jean Dupont',
  preferences: {
    darkMode: false,
    language: 'fr'
  }
};

// Configuration des endpoints mockés

// Authentification
mock.onPost('/api/auth/login').reply(200, {
  token: 'mock-jwt-token',
  user: mockUser
});

// Véhicules
mock.onGet('/api/vehicles').reply(200, mockVehicles);

/*mock.onGet(new RegExp('/api/vehicles/\\d+')).reply((config) => {
  const id = parseInt(config.url.split('/').pop());
  const vehicle = mockVehicles.find(v => v.id === id);
  return vehicle ? [200, vehicle] : [404, { message: 'Véhicule non trouvé' }];
});*/

// Vérifiez ce code dans axiosMock.js
mock.onGet(new RegExp('/api/vehicles/\\d+')).reply((config) => {
    console.log("icccci")
    const id = parseInt(config.url.split('/').pop());
    const vehicle = mockVehicles.find(v => v.id === id);
    return vehicle ? [200, vehicle] : [404, { message: 'Véhicule non trouvé' }];
  });

mock.onPost('/api/vehicles').reply((config) => {
  const newVehicle = JSON.parse(config.data);
  newVehicle.id = mockVehicles.length + 1;
  mockVehicles.push(newVehicle);
  return [201, newVehicle];
});

mock.onPut(new RegExp('/api/vehicles/\\d+')).reply((config) => {
  const id = parseInt(config.url.split('/').pop());
  const vehicleIndex = mockVehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) return [404, { message: 'Véhicule non trouvé' }];
  
  const updatedVehicle = { ...JSON.parse(config.data), id };
  mockVehicles[vehicleIndex] = updatedVehicle;
  return [200, updatedVehicle];
});

mock.onDelete(new RegExp('/api/vehicles/\\d+')).reply((config) => {
  const id = parseInt(config.url.split('/').pop());
  const vehicleIndex = mockVehicles.findIndex(v => v.id === id);
  if (vehicleIndex === -1) return [404, { message: 'Véhicule non trouvé' }];
  
  mockVehicles.splice(vehicleIndex, 1);
  return [204];
});

// Maintenance
mock.onGet('/api/maintenance').reply(200, mockMaintenanceRecords);

/*mock.onGet(new RegExp('/api/vehicles/\\d+/maintenance')).reply((config) => {
  const vehicleId = parseInt(config.url.split('/')[3]);
  const records = mockMaintenanceRecords.filter(r => r.vehicleId === vehicleId);
  return [200, records];
});*/

mock.onGet(new RegExp('/api/vehicles/\\d+/maintenance')).reply((config) => {
    const vehicleId = parseInt(config.url.split('/')[3]);
    const records = mockMaintenanceRecords.filter(r => r.vehicleId === vehicleId);
    return [200, records];
  });

mock.onPost('/api/maintenance').reply((config) => {
  const newRecord = JSON.parse(config.data);
  newRecord.id = mockMaintenanceRecords.length + 1;
  mockMaintenanceRecords.push(newRecord);
  return [201, newRecord];
});

// Rappels
mock.onGet('/api/reminders').reply(200, mockReminders);

mock.onGet(new RegExp('/api/vehicles/\\d+/reminders')).reply((config) => {
  const vehicleId = parseInt(config.url.split('/')[3]);
  const reminders = mockReminders.filter(r => r.vehicleId === vehicleId);
  return [200, reminders];
});

mock.onPost('/api/reminders').reply((config) => {
  const newReminder = JSON.parse(config.data);
  newReminder.id = mockReminders.length + 1;
  mockReminders.push(newReminder);
  return [201, newReminder];
});

mock.onPut(new RegExp('/api/reminders/\\d+')).reply((config) => {
  const id = parseInt(config.url.split('/').pop());
  const reminderIndex = mockReminders.findIndex(r => r.id === id);
  if (reminderIndex === -1) return [404, { message: 'Rappel non trouvé' }];
  
  const updatedReminder = { ...JSON.parse(config.data), id };
  mockReminders[reminderIndex] = updatedReminder;
  return [200, updatedReminder];
});

// Utilisateur
mock.onGet('/api/user/profile').reply(200, mockUser);

mock.onPut('/api/user/preferences').reply((config) => {
  const updatedPreferences = JSON.parse(config.data);
  mockUser.preferences = { ...mockUser.preferences, ...updatedPreferences };
  return [200, mockUser];
});

// Export de l'instance API avec le mock configuré
export default api;