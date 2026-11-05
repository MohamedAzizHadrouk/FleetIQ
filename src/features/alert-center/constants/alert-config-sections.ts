import type { AlertCategory, AlertType } from '@/types/alerts';
import { ALERT_TAXONOMY } from './alert-taxonomy';
import { getFleetParcAlertTypes } from './fleet-parc-alert-modules';
import { getSecurityAlertTypes, getSecurityOnlyAlertTypes } from './security-alert-types';
import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';

export type AlertConfigSectionId =
  | 'dashboard'
  | 'vehicle_management'
  | 'geolocation'
  | 'security';

export interface AlertConfigSection {
  id: AlertConfigSectionId;
  label: string;
  description: string;
  categories: AlertCategory[];
}

export const ALERT_CONFIG_SECTIONS: AlertConfigSection[] = [
  {
    id: 'dashboard',
    label: 'Alerte tableau de bord',
    description: 'Indicateurs véhicule sans seuil — activation, ordre et niveau',
    categories: ['dashboard'],
  },
  {
    id: 'vehicle_management',
    label: 'Alerte Gestion de parc',
    description: 'Modules Parc — maintenance, documents, location, sinistres',
    categories: ['vehicle_management'],
  },
  {
    id: 'geolocation',
    label: 'Alerte Geofencing',
    description: 'Zones, itinéraires et règles geofence configurables',
    categories: ['geolocation'],
  },
  {
    id: 'security',
    label: 'Alerte Sécurité',
    description: 'Connectivité, protection, conduite GPS et urgences',
    categories: ['security', 'driving_quality'],
  },
];

export const ALL_CONFIG_SECTION_IDS: AlertConfigSectionId[] = ALERT_CONFIG_SECTIONS.map((s) => s.id);

export function getAlertTypesForSection(sectionId: AlertConfigSectionId): AlertType[] {
  if (sectionId === 'vehicle_management') {
    return getFleetParcAlertTypes();
  }
  if (sectionId === 'security') {
    return getSecurityAlertTypes();
  }
  const section = ALERT_CONFIG_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return [];
  return Object.values(ALERT_TAXONOMY)
    .filter(
      (e) =>
        e.id !== 'all' &&
        e.id !== 'unknown' &&
        e.configurableInParametrage &&
        section.categories.includes(e.category)
    )
    .map((e) => e.id);
}

export function getSectionForCategory(category: AlertCategory): AlertConfigSectionId {
  if (category === 'dashboard') return 'dashboard';
  if (category === 'vehicle_management') return 'vehicle_management';
  if (category === 'geolocation') return 'geolocation';
  return 'security';
}

export function resolveCategoriesFromSections(sectionIds: AlertConfigSectionId[]): AlertCategory[] {
  const categories = new Set<AlertCategory>();
  for (const sectionId of sectionIds) {
    const section = ALERT_CONFIG_SECTIONS.find((s) => s.id === sectionId);
    section?.categories.forEach((category) => categories.add(category));
  }
  return [...categories];
}

export type AlertCenterSectionId =
  | 'dashboard'
  | 'vehicle_management'
  | 'geolocation'
  | 'security'
  | 'driving_quality';

export interface AlertCenterSection {
  id: AlertCenterSectionId;
  label: string;
}

export const ALERT_CENTER_SECTIONS: AlertCenterSection[] = [
  { id: 'dashboard', label: 'Défaut alerte tableau de bord' },
  { id: 'vehicle_management', label: 'Alerte Gestion de parc' },
  { id: 'geolocation', label: 'Alerte Geofencing' },
  { id: 'security', label: 'Alerte Sécurité' },
  { id: 'driving_quality', label: 'Alerte Qualité de conduite' },
];

function getAlertTypesByCategory(category: AlertCategory): AlertType[] {
  return Object.values(ALERT_TAXONOMY)
    .filter((e) => e.id !== 'all' && e.id !== 'unknown' && e.category === category)
    .map((e) => e.id);
}

export function resolveCategoriesFromCenterSections(
  sectionIds: AlertCenterSectionId[]
): AlertCategory[] {
  const categories = new Set<AlertCategory>();
  for (const sectionId of sectionIds) {
    if (sectionId === 'driving_quality') {
      categories.add('driving_quality');
    } else if (sectionId === 'security') {
      categories.add('security');
    } else {
      const section = ALERT_CONFIG_SECTIONS.find((s) => s.id === sectionId);
      section?.categories.forEach((category) => categories.add(category));
    }
  }
  return [...categories];
}

export function getAlertTypesForCenterSection(sectionId: AlertCenterSectionId): AlertType[] {
  switch (sectionId) {
    case 'dashboard':
      return DASHBOARD_INDICATORS.map((indicator) => indicator.alertTypeId);
    case 'vehicle_management':
      return getFleetParcAlertTypes();
    case 'geolocation':
      return getAlertTypesByCategory('geolocation');
    case 'security':
      return getSecurityOnlyAlertTypes();
    case 'driving_quality':
      return getAlertTypesByCategory('driving_quality');
    default:
      return [];
  }
}
