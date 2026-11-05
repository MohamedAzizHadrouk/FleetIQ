import type { AlertNotificationContact } from '@/types/alert-config';

export const INITIAL_ALERT_CONTACTS: AlertNotificationContact[] = [
  {
    id: 'contact-1',
    name: 'Chawki Zorgui',
    email: 'chawki.zorgui@tunav.com',
    role: 'administrator',
    vehicleIds: ['1', '2', '3'],
  },
  {
    id: 'contact-2',
    name: 'Skander Jiji',
    email: 'skanderjiji@gmail.com',
    role: 'driver',
    driverId: 'drv-2',
    vehicleIds: ['1'],
  },
  {
    id: 'contact-3',
    name: 'Hassen Krichen',
    email: 'hassen.krichen@tunav.com',
    role: 'fleet_manager',
    vehicleIds: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'contact-4',
    name: 'Marwa Henchir',
    email: 'marwa.henchir@tunav.com',
    role: 'user',
    vehicleIds: ['6'],
  },
  {
    id: 'contact-5',
    name: 'Jean Dupont',
    phone: '+216 22 111 222',
    role: 'driver',
    driverId: 'drv-1',
    vehicleIds: ['2'],
  },
  {
    id: 'contact-6',
    name: 'Karim Ben Ali',
    phone: '+216 50 123 456',
    role: 'administrator',
    vehicleIds: ['7', '8', '9', '10'],
  },
];
