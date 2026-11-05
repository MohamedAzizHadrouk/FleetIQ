import type { Vehicle } from '../types';

export const mockVehicle: Vehicle = {
  id: '1',
  name: 'Fleet-001',
  status: 'active',
  speed: 65,
  location: 'Rue de Rivoli, Paris',
  coordinates: [48.8566, 2.3522],
  lastUpdate: "À l'instant",
  driver: 'Jean Dupont',
  batteryLevel: 85,
};

export const mockVehicles: Vehicle[] = [
  mockVehicle,
  {
    id: '2',
    name: 'Fleet-002',
    status: 'idle',
    speed: 0,
    location: 'Avenue des Champs-Élysées',
    coordinates: [48.8698, 2.3078],
    lastUpdate: 'Il y a 12 min',
    driver: 'Marie Martin',
    batteryLevel: 42,
  },
  {
    id: '3',
    name: 'Fleet-003',
    status: 'offline',
    speed: 0,
    location: 'Gare de Lyon',
    coordinates: [48.8443, 2.3749],
    lastUpdate: 'Il y a 3h',
    driver: 'Pierre Durand',
    batteryLevel: 0,
  },
];
