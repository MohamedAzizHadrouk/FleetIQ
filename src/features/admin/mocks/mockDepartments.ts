import type { AdminDepartment } from '../types/admin.types';

/** Seed synced with alert-center MOCK_ORG_STRUCTURE department ids. */
export const INITIAL_DEPARTMENTS: AdminDepartment[] = [
  {
    id: 'dept-transport',
    name: 'Transport',
    type: 'groupe',
    level: 'racine',
    vehicleIds: ['1', '2', '3'],
  },
  {
    id: 'dept-logistique',
    name: 'Logistique',
    type: 'simple',
    level: 'branche',
    parentId: 'dept-transport',
    vehicleIds: ['4', '5'],
  },
  {
    id: 'dept-commercial',
    name: 'Commercial',
    type: 'simple',
    level: 'racine',
    vehicleIds: ['6'],
  },
  {
    id: 'dept-direction',
    name: 'Direction',
    type: 'groupe',
    level: 'racine',
    vehicleIds: ['7', '8'],
  },
  {
    id: 'dept-technique',
    name: 'Technique',
    type: 'simple',
    level: 'branche',
    parentId: 'dept-direction',
    vehicleIds: ['9', '10'],
  },
];
