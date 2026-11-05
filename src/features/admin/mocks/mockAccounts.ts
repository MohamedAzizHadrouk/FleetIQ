import type { AdminAccount } from '../types/admin.types';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

export const INITIAL_ACCOUNTS: AdminAccount[] = [
  {
    id: 'acc-1',
    login: 'jdupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    scopeType: 'all_fleet',
    departmentIds: [],
    specialtyIds: [],
    accessPageIds: ['tous', 'suivi', 'administration', 'gestion_comptes', 'gestion_departements'],
    createdAt: daysAgo(200),
    lastActiveAt: daysAgo(2),
  },
  {
    id: 'acc-2',
    login: 'mmartin',
    firstName: 'Marie',
    lastName: 'Martin',
    scopeType: 'specific_departments',
    departmentIds: ['dept-logistique', 'dept-transport'],
    specialtyIds: [],
    accessPageIds: ['suivi', 'gestion_parc'],
    createdAt: daysAgo(15),
    lastActiveAt: daysAgo(5),
  },
  {
    id: 'acc-3',
    login: 'pdurand',
    firstName: 'Pierre',
    lastName: 'Durand',
    scopeType: 'specialty',
    departmentIds: [],
    specialtyIds: ['spec-livraison'],
    accessPageIds: ['suivi', 'parametrage_alertes', 'envoi_alertes'],
    createdAt: daysAgo(8),
    lastActiveAt: null,
  },
  {
    id: 'acc-4',
    login: 'slefevre',
    firstName: 'Sophie',
    lastName: 'Lefèvre',
    scopeType: 'specific_departments',
    departmentIds: ['dept-commercial'],
    specialtyIds: [],
    accessPageIds: ['suivi', 'gestion_parc', 'geofencing'],
    createdAt: daysAgo(45),
    lastActiveAt: daysAgo(40),
  },
];
