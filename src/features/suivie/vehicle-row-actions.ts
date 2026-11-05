import type { LucideIcon } from 'lucide-react';
import {
  MapPin,
  Route,
  StopCircle,
  FileText,
  Zap,
  Navigation,
  Power,
  Settings,
} from 'lucide-react';
import type { Vehicle } from '@/types';

export type VehicleRowActionId =
  | 'showOnMap'
  | 'showTrajectory'
  | 'showStopRun'
  | 'showDetailedReport'
  | 'showSpeedExcess'
  | 'requestPosition'
  | 'remoteStop'
  | 'alertSettings';

export interface VehicleRowActionDef {
  id: VehicleRowActionId;
  label: string;
  icon: LucideIcon;
}

export const VEHICLE_ROW_ACTIONS: VehicleRowActionDef[] = [
  { id: 'showOnMap', label: 'Afficher sur la carte', icon: MapPin },
  { id: 'showTrajectory', label: 'Afficher trajectoire', icon: Route },
  { id: 'showStopRun', label: 'Afficher Stop/Circulation', icon: StopCircle },
  {
    id: 'showDetailedReport',
    label: 'Afficher le rapport détaillé',
    icon: FileText,
  },
  { id: 'showSpeedExcess', label: 'Afficher les excès de vitesse', icon: Zap },
  {
    id: 'requestPosition',
    label: 'Demande position actuelle',
    icon: Navigation,
  },
  { id: 'remoteStop', label: 'Arrêt à distance (AAD)', icon: Power },
  { id: 'alertSettings', label: 'Paramétrage des alertes', icon: Settings },
];

export function hasAssignedEquipment(vehicle: Vehicle): boolean {
  return Boolean(vehicle.imei?.trim());
}

export function isVehicleRowActionVisible(
  actionId: VehicleRowActionId,
  vehicle: Vehicle,
  isAdmin: boolean
): boolean {
  switch (actionId) {
    case 'requestPosition':
      return Boolean(vehicle.supportsCurrentPosition);
    case 'remoteStop':
      return isAdmin && Boolean(vehicle.supportsAad);
    case 'alertSettings':
      return isAdmin;
    default:
      return true;
  }
}

export function getVisibleVehicleRowActions(
  vehicle: Vehicle,
  isAdmin: boolean
): VehicleRowActionDef[] {
  return VEHICLE_ROW_ACTIONS.filter((a) =>
    isVehicleRowActionVisible(a.id, vehicle, isAdmin)
  );
}

/** Deterministic mock GPS path around a vehicle for trajectory preview */
export function buildMockTrajectoryPath(
  vehicle: Vehicle,
  pointCount = 12
): [number, number][] {
  const [lat0, lng0] = vehicle.coordinates;
  const points: [number, number][] = [];
  for (let i = 0; i < pointCount; i++) {
    const t = i / Math.max(pointCount - 1, 1);
    const angle = t * Math.PI * 1.4;
    const radius = 0.002 + t * 0.006;
    points.push([
      lat0 + Math.sin(angle) * radius,
      lng0 + Math.cos(angle) * radius * 1.2,
    ]);
  }
  return points;
}
