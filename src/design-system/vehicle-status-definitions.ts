import {
  PauseCircle,
  Radio,
  Satellite,
  WifiOff,
  type LucideIcon,
} from 'lucide-react';
import type { VehicleStatus } from '@/types';
import type { GpsFilterStatus } from '@/types/alerts';

export interface StatusDefinition {
  label: string;
  description: string;
  icon: LucideIcon;
  badgeVariant: 'success' | 'medium' | 'outline' | 'info' | 'critical';
}

export const VEHICLE_STATUS_DEFINITIONS: Record<VehicleStatus, StatusDefinition> = {
  active: {
    label: 'En ligne',
    description: 'Véhicule actif, communique avec la plateforme',
    icon: Radio,
    badgeVariant: 'success',
  },
  idle: {
    label: "À l'arrêt",
    description: 'Connecté mais immobile (contact ON)',
    icon: PauseCircle,
    badgeVariant: 'medium',
  },
  offline: {
    label: 'Hors ligne',
    description: 'Aucune communication récente reçue',
    icon: WifiOff,
    badgeVariant: 'outline',
  },
};

export const GPS_STATUS_DEFINITIONS: Record<GpsFilterStatus, StatusDefinition> = {
  online: {
    label: 'En ligne',
    description: 'Position GPS valide reçue du traceur',
    icon: Satellite,
    badgeVariant: 'info',
  },
  offline: {
    label: 'Hors ligne',
    description: 'Traceur ne communique plus',
    icon: WifiOff,
    badgeVariant: 'critical',
  },
};

/** Labels for fleet overview panel (operational status, not GPS) */
export const FLEET_ONLINE_DEFINITION: StatusDefinition = VEHICLE_STATUS_DEFINITIONS.active;
export const FLEET_OFFLINE_DEFINITION: StatusDefinition = VEHICLE_STATUS_DEFINITIONS.offline;

export function getVehicleStatusDefinition(status: VehicleStatus): StatusDefinition {
  return VEHICLE_STATUS_DEFINITIONS[status];
}

export function getGpsStatusDefinition(status: GpsFilterStatus): StatusDefinition {
  return GPS_STATUS_DEFINITIONS[status];
}
