import type { AlertCategory } from '@/types/alerts';

export interface AlertCategoryConfig {
  id: AlertCategory;
  label: string;
  description: string;
}

export const ALERT_CATEGORIES: AlertCategoryConfig[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord véhicule',
    description: 'Freinage, portes, éclairage, moteur, conduite, énergie',
  },
  {
    id: 'vehicle_management',
    label: 'Gestion véhicule',
    description: 'Entretien, documents, assurance, contrats',
  },
  {
    id: 'geolocation',
    label: 'Géolocalisation',
    description: 'Geofences, itinéraires, arrêts, zones',
  },
  {
    id: 'driving_quality',
    label: 'Qualité de conduite',
    description: 'Vitesse, freinage, accélération, ralenti',
  },
  {
    id: 'security',
    label: 'Sécurité',
    description: 'GPS, GSM, vol, déconnexion, SOS',
  },
];

export const CATEGORY_LABELS: Record<AlertCategory, string> = Object.fromEntries(
  ALERT_CATEGORIES.map((c) => [c.id, c.label])
) as Record<AlertCategory, string>;
