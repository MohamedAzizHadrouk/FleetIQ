import type { AlertCenterSectionId } from './alert-config-sections';

export type SectionAlertColumnId =
  | 'alertDateTime'
  | 'licensePlate'
  | 'driverName'
  | 'location'
  | 'zone'
  | 'eventLabel'
  | 'alertLabel'
  | 'detail'
  | 'action';

function formatSectionAlertDateTime(iso: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export interface SectionAlertColumn {
  id: SectionAlertColumnId;
  label: string;
}

export interface BaseSectionAlertRow {
  vehicleId: string;
  licensePlate: string;
  driverName: string;
  location: string;
  coordinates: [number, number];
  alertAt: string;
}

export interface DashboardAlertRow extends BaseSectionAlertRow {}

export interface VehicleManagementAlertRow extends BaseSectionAlertRow {
  alertLabel: string;
}

export interface GeolocationAlertRow extends BaseSectionAlertRow {
  zone: string;
  eventLabel: string;
}

export interface DetailAlertRow extends BaseSectionAlertRow {
  detail: string;
}

export type SectionAlertVehicleRow =
  | DashboardAlertRow
  | VehicleManagementAlertRow
  | GeolocationAlertRow
  | DetailAlertRow;

export function getColumnsForSection(sectionId: AlertCenterSectionId): SectionAlertColumn[] {
  switch (sectionId) {
    case 'dashboard':
      return [
        { id: 'alertDateTime', label: 'Date / Heure' },
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    case 'vehicle_management':
      return [
        { id: 'alertDateTime', label: 'Date / Heure' },
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'alertLabel', label: 'Alerte' },
      ];
    case 'geolocation':
      return [
        { id: 'alertDateTime', label: 'Date / Heure' },
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'zone', label: 'Zone' },
        { id: 'eventLabel', label: 'Événement' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    case 'security':
    case 'driving_quality':
      return [
        { id: 'alertDateTime', label: 'Date / Heure' },
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'detail', label: 'Détail' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
    default:
      return [
        { id: 'alertDateTime', label: 'Date / Heure' },
        { id: 'licensePlate', label: 'Matricule' },
        { id: 'driverName', label: 'Chauffeur' },
        { id: 'location', label: 'Lieu' },
        { id: 'action', label: 'Action' },
      ];
  }
}

export function getCellValue(
  row: SectionAlertVehicleRow,
  columnId: SectionAlertColumnId
): string | null {
  if (columnId === 'action') return null;
  if (columnId === 'alertDateTime') return formatSectionAlertDateTime(row.alertAt);
  const value = row[columnId as keyof SectionAlertVehicleRow];
  if (typeof value === 'string') return value;
  return '—';
}
