import type { LucideIcon } from 'lucide-react';
import { roadTrack } from '@/features/fleetiq/road-position';
import {
  Ban,
  ClipboardList,
  Crosshair,
  Hand,
  MapPinned,
  Route,
  Truck,
  Wrench,
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
  { id: 'showOnMap', label: 'Afficher sur la carte', icon: MapPinned },
  { id: 'showTrajectory', label: 'Afficher trajectoire', icon: Route },
  { id: 'showStopRun', label: 'Afficher Stop/Circulation', icon: Ban },
  { id: 'showDetailedReport', label: 'Afficher le rapport détaillé', icon: ClipboardList },
  { id: 'showSpeedExcess', label: 'Afficher les excès de vitesse', icon: Truck },
  { id: 'requestPosition', label: 'Demande position actuelle', icon: Crosshair },
  { id: 'remoteStop', label: 'Arrêt à distance (AAD)', icon: Hand },
  { id: 'alertSettings', label: 'Paramétrage des alertes', icon: Wrench },
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

/**
 * GPS track for the trajectory preview: the real road route driven so far
 * (OSRM data, see road-routes.ts). Falls back to a small synthetic loop only
 * for vehicles without a generated route.
 */
export function buildMockTrajectoryPath(
  vehicle: Vehicle,
  pointCount = 12
): [number, number][] {
  const road = roadTrack(vehicle);
  if (road && road.length >= 2) return road;
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

/** Why an action cannot run for this vehicle (null = available). */
export function vehicleRowActionUnavailableReason(
  actionId: VehicleRowActionId,
  vehicle: Vehicle,
  isAdmin: boolean
): string | null {
  if (isVehicleRowActionVisible(actionId, vehicle, isAdmin)) return null;
  if (actionId === 'alertSettings' || (actionId === 'remoteStop' && !isAdmin)) {
    return 'Réservé aux administrateurs';
  }
  return 'Non supporté par l’équipement';
}

/** All row actions, always listed, with availability for this vehicle. */
export function getVehicleRowActions(
  vehicle: Vehicle,
  isAdmin: boolean
): (VehicleRowActionDef & { unavailableReason: string | null })[] {
  return VEHICLE_ROW_ACTIONS.map((a) => ({
    ...a,
    unavailableReason: vehicleRowActionUnavailableReason(a.id, vehicle, isAdmin),
  }));
}
