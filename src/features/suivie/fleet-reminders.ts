import type { LucideIcon } from 'lucide-react';
import {
  Wrench,
  ClipboardList,
  CarFront,
  HandCoins,
  FileClock,
} from 'lucide-react';

export type FleetReminderKind =
  | 'maintenance'
  | 'document'
  | 'damage'
  | 'payment'
  | 'expiredContract';

export type FleetReminderFlags = Record<FleetReminderKind, boolean>;

export interface FleetReminderConfig {
  id: FleetReminderKind;
  label: string;
  icon: LucideIcon;
  activeClassName: string;
  dialogTitle: string;
  dialogAction: string;
  mockLines: (vehicleName: string) => string[];
}

export const EMPTY_FLEET_REMINDERS: FleetReminderFlags = {
  maintenance: false,
  document: false,
  damage: false,
  payment: false,
  expiredContract: false,
};

export const FLEET_REMINDER_CONFIGS: FleetReminderConfig[] = [
  {
    id: 'maintenance',
    label: 'Maintenance à faire',
    icon: Wrench,
    activeClassName: 'text-amber-600 hover:text-amber-700',
    dialogTitle: 'Entretien à effectuer',
    dialogAction: 'Ajuster / confirmer',
    mockLines: (name) => [
      `Vidange due — ${name}`,
      'Contrôle technique planifié sous 7 jours',
      'Remplacement plaquettes frein (priorité moyenne)',
    ],
  },
  {
    id: 'document',
    label: 'Document à ajuster',
    icon: ClipboardList,
    activeClassName: 'text-blue-600 hover:text-blue-700',
    dialogTitle: 'Rappels documents',
    dialogAction: 'Ajuster le document',
    mockLines: (name) => [
      `Assurance expire bientôt — ${name}`,
      'Carte grise : mise à jour requise',
      'Visite technique : pièce manquante',
    ],
  },
  {
    id: 'damage',
    label: 'Véhicule endommagé',
    icon: CarFront,
    activeClassName: 'text-rose-600 hover:text-rose-700',
    dialogTitle: 'Sinistre / accident',
    dialogAction: 'Fermer / ajuster',
    mockLines: (name) => [
      `Sinistre ouvert — ${name}`,
      'Type : collision légère (aile avant)',
      'Statut : en attente de réparation',
    ],
  },
  {
    id: 'payment',
    label: 'Paiement location dû',
    icon: HandCoins,
    activeClassName: 'text-emerald-600 hover:text-emerald-700',
    dialogTitle: 'Paiement contrat',
    dialogAction: 'Ajuster le paiement',
    mockLines: (name) => [
      `Loyer en retard — ${name}`,
      'Montant dû : 450 TND',
      'Échéance dépassée de 5 jours',
    ],
  },
  {
    id: 'expiredContract',
    label: 'Contrat location expiré',
    icon: FileClock,
    activeClassName: 'text-violet-600 hover:text-violet-700',
    dialogTitle: 'Contrats expirés',
    dialogAction: 'Renouveler / clôturer',
    mockLines: (name) => [
      `Contrat de location expiré — ${name}`,
      'Date de fin : il y a 3 jours',
      'Action : renouveler ou clôturer le dossier',
    ],
  },
];

export function countActiveReminders(flags: FleetReminderFlags): number {
  return FLEET_REMINDER_CONFIGS.reduce(
    (n, cfg) => n + (flags[cfg.id] ? 1 : 0),
    0
  );
}

export function dashboardSortLabel(flags: FleetReminderFlags): string {
  const count = countActiveReminders(flags);
  return count === 0 ? '—' : String(count);
}
