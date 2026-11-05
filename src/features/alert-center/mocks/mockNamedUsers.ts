import type { NamedUser } from '@/types/alert-config';

export const MOCK_NAMED_USERS: NamedUser[] = [
  { id: 'user-1', name: 'Karim Ben Ali', role: 'administrator' },
  { id: 'user-2', name: 'Marwa Henchir', role: 'fleet_manager' },
  { id: 'user-3', name: 'Hassen Krichen', role: 'administrator' },
  { id: 'user-4', name: 'Skander Jiji', role: 'user' },
  { id: 'user-5', name: 'Ghada Mansour', role: 'user' },
];

export const MOCK_DRIVERS = [
  {
    id: 'drv-1',
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@tunav.com',
    mobile: '+216 22 111 222',
  },
  {
    id: 'drv-2',
    nom: 'Elj',
    prenom: 'Skander',
    email: 'skanderjiji@gmail.com',
    mobile: '+216 98 333 444',
  },
  {
    id: 'drv-3',
    nom: 'Zorgui',
    prenom: 'Chawki',
    email: 'chawki.zorgui@tunav.com',
    mobile: '+216 55 666 777',
  },
  {
    id: 'drv-4',
    nom: 'Krichen',
    prenom: 'Hassen',
    email: 'hassen.krichen@tunav.com',
    mobile: '+216 20 888 999',
  },
];
