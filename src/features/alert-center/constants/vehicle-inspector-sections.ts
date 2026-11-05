import type { AlertType } from '@/types/alerts';
import { FLEET_PARC_ALERT_MODULES } from './fleet-parc-alert-modules';

const documentsModule = FLEET_PARC_ALERT_MODULES.find((m) => m.id === 'documents');

export const DOCUMENT_ALERT_TYPES: AlertType[] = documentsModule?.alertTypes ?? [
  'technical_inspection',
  'insurance_expired',
  'registration_expired',
  'documents_expired',
];

export const GEOFENCE_ALERT_TYPES: AlertType[] = ['geofence', 'geofence_exit'];

const DOCUMENT_SET = new Set<AlertType>(DOCUMENT_ALERT_TYPES);
const GEOFENCE_SET = new Set<AlertType>(GEOFENCE_ALERT_TYPES);

export function isDocumentAlert(type: AlertType): boolean {
  return DOCUMENT_SET.has(type);
}

export function isGeofenceAlert(type: AlertType): boolean {
  return GEOFENCE_SET.has(type);
}

export function isGeneralAlert(type: AlertType): boolean {
  return !isDocumentAlert(type) && !isGeofenceAlert(type);
}
