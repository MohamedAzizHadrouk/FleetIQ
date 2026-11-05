import type { AlertType, FleetAlert } from '@/types/alerts';
import { getTaxonomyEntry } from '../constants/alert-taxonomy';

export interface VehicleRuntimeState {
  ignitionOn: boolean;
  isMoving: boolean;
}

export function shouldShowAlert(
  alert: Pick<FleetAlert, 'type'>,
  vehicle: VehicleRuntimeState,
  alertWhenContactOn?: boolean
): boolean {
  const config = getTaxonomyEntry(alert.type);
  if (config.contactOffOnly && vehicle.ignitionOn && !alertWhenContactOn) return false;
  if (config.drivingOnly && !vehicle.isMoving) return false;
  return true;
}

export function filterAlertsByBusinessRules<T extends Pick<FleetAlert, 'type'>>(
  alerts: T[],
  vehicle: VehicleRuntimeState,
  contactOnOverrides?: Partial<Record<AlertType, boolean>>
): T[] {
  return alerts.filter((a) =>
    shouldShowAlert(a, vehicle, contactOnOverrides?.[a.type])
  );
}

export function isContactOffOnlyType(type: AlertType): boolean {
  return getTaxonomyEntry(type).contactOffOnly === true;
}

export function isDrivingOnlyType(type: AlertType): boolean {
  return getTaxonomyEntry(type).drivingOnly === true;
}

export function deriveIgnitionFromVehicle(status: string, speed: number): boolean {
  return status === 'active' || (status === 'idle' && speed === 0);
}

export function deriveIsMoving(speed: number, status: string): boolean {
  return speed > 5 || status === 'active';
}
