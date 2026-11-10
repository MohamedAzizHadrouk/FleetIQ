import spriteSource from '@/assets/fleetiq/fleetiq-vehicles-sprite.svg?raw';
import type { Vehicle } from '@/types';
import type { VehicleIconType } from '@/features/parc/vehicle-types';

/**
 * FleetIQ vehicle icon kit (exported from the "Card B+ & icônes véhicules" design).
 * Icons are 60×120 top-down views pointing north (heading 0°), served from one
 * SVG sprite injected once into the document and referenced with <use>.
 */

export type FleetiqVehicleType =
  | 'car'
  | 'moto'
  | 'van'
  | 'pickup'
  | 'truck'
  | 'bus'
  | 'taxi'
  | 'tractor'
  | 'ambulance'
  | 'police'
  | 'fire'
  | 'delivery';

export type FleetiqMarkerStatus = 'moving' | 'idle' | 'stopped' | 'offline' | 'alert';

/** Design tokens (see src/assets/fleetiq/design-tokens.css). */
export const FIQ = {
  navy: '#0F1B3D',
  blue: '#2F6BFF',
  muted: '#5B6B8C',
  border: '#E3E9F4',
  borderStrong: '#DCE3EF',
  surfaceAlt: '#F0F3F9',
  moving: '#16A34A',
  /** Contact ON at 0 km/h */
  idle: '#F59E0B',
  /** Stopped, contact OFF */
  stopped: '#E5484D',
  offline: '#8A94A6',
  alert: '#E5484D',
  selected: '#2F6BFF',
} as const;

export const FIQ_STATUS_COLOR: Record<FleetiqMarkerStatus, string> = {
  moving: FIQ.moving,
  idle: FIQ.idle,
  stopped: FIQ.stopped,
  offline: FIQ.offline,
  alert: FIQ.alert,
};

export const FIQ_STATUS_LABEL: Record<FleetiqMarkerStatus, string> = {
  moving: 'En mouvement',
  idle: 'Contact ON · 0 km/h',
  stopped: 'À l’arrêt',
  offline: 'Hors ligne',
  alert: 'Alerte',
};

const TYPE_MAP: Record<VehicleIconType, FleetiqVehicleType> = {
  voiture: 'car',
  moto: 'moto',
  fourgon: 'van',
  pickup: 'pickup',
  camion: 'truck',
  bus: 'bus',
  taxi: 'taxi',
  tracteur: 'tractor',
  ambulance: 'ambulance',
  police: 'police',
  camion_pompier: 'fire',
  livraison: 'delivery',
};

export const FIQ_TYPE_LABEL: Record<FleetiqVehicleType, string> = {
  car: 'Voiture',
  moto: 'Moto',
  van: 'Fourgon',
  pickup: 'Pick-up',
  truck: 'Camion',
  bus: 'Bus',
  taxi: 'Taxi',
  tractor: 'Tracteur',
  ambulance: 'Ambulance',
  police: 'Police',
  fire: 'Camion pompier',
  delivery: 'Livraison',
};

/** Platform icon type (Parc module) → exported icon type. Defaults to truck. */
export function toFleetiqType(iconType?: VehicleIconType | string | null): FleetiqVehicleType {
  return TYPE_MAP[iconType as VehicleIconType] ?? 'truck';
}

/** Platform tracking status (+ critical alert flag) → marker status. */
export function toFleetiqStatus(
  status: Vehicle['status'],
  hasCriticalAlert = false
): FleetiqMarkerStatus {
  if (hasCriticalAlert && status !== 'offline') return 'alert';
  if (status === 'active') return 'moving';
  if (status === 'idle') return 'idle';
  if (status === 'stopped') return 'stopped';
  return 'offline';
}

export function normalizeHeading(heading?: number): number {
  if (typeof heading !== 'number' || Number.isNaN(heading)) return 0;
  return ((heading % 360) + 360) % 360;
}

const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
export function headingToCompass(heading?: number): string {
  return COMPASS[Math.round(normalizeHeading(heading) / 45) % 8];
}

const SPRITE_ID = 'fleetiq-vehicles-sprite';

/** Inject the sprite once. Uses a 0×0 box (not display:none) so gradients/filters render. */
export function ensureFleetiqSprite(): void {
  if (typeof document === 'undefined' || document.getElementById(SPRITE_ID)) return;
  const host = document.createElement('div');
  host.id = SPRITE_ID;
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  host.innerHTML = spriteSource.replace('style="display:none"', 'width="0" height="0"');
  document.body.prepend(host);
}

function symbolHref(type: FleetiqVehicleType, mode: '2d' | '3d') {
  return `#fleetiq-${mode}-${type}`;
}

/** React icon (3D keeps its livery colours; 2D uses `color`). */
export function FleetiqVehicleIcon({
  type,
  mode = '3d',
  size = 46,
  color,
  className,
}: {
  type: FleetiqVehicleType;
  mode?: '2d' | '3d';
  size?: number;
  color?: string;
  className?: string;
}) {
  ensureFleetiqSprite();
  return (
    <svg
      width={size / 2}
      height={size}
      viewBox="0 0 60 120"
      className={className}
      style={{ color, overflow: 'visible' }}
      aria-hidden
    >
      <use href={symbolHref(type, mode)} />
    </svg>
  );
}

/**
 * Leaflet divIcon HTML for a vehicle marker: status halo, heading rotation,
 * travel beam when moving, scale-up + blue ring when selected.
 */
export function fleetiqMarkerHtml({
  type,
  status,
  heading,
  selected = false,
  mode = '3d',
}: {
  type: FleetiqVehicleType;
  status: FleetiqMarkerStatus;
  heading?: number;
  selected?: boolean;
  mode?: '2d' | '3d';
}): string {
  ensureFleetiqSprite();
  const c = selected ? FIQ.selected : FIQ_STATUS_COLOR[status];
  const h = normalizeHeading(heading);
  const box = FLEETIQ_MARKER_BOX;
  const ring = 60;
  const off = (box - ring) / 2;
  const beam =
    status === 'moving'
      ? `<path d="M30 4 L4 -46 Q30 -58 56 -46 Z" fill="${c}" fill-opacity="0.22"/>`
      : '';
  const pulse =
    status === 'alert' && !selected
      ? `<span class="fiq-marker-pulse" style="border-color:${c}"></span>`
      : '';
  return `
    <div class="fiq-marker${selected ? ' is-selected' : ''}" style="width:${box}px;height:${box}px;position:relative;">
      <div class="fiq-marker-halo" style="position:absolute;left:${off}px;top:${off}px;width:${ring}px;height:${ring}px;border-radius:50%;
        border:2px solid ${c};background:${c}29;box-sizing:border-box;opacity:${status === 'offline' ? 0.75 : 1};
        ${selected ? `box-shadow:0 0 0 4px ${c}33, 0 6px 16px rgba(15,27,61,.28);` : 'box-shadow:0 4px 12px rgba(15,27,61,.18);'}">${pulse}</div>
      <div style="position:absolute;left:${box / 2 - 17}px;top:${box / 2 - 34}px;width:34px;height:68px;transform:rotate(${h}deg);transform-origin:50% 50%;">
        <svg width="34" height="68" viewBox="0 0 60 120" style="overflow:visible;color:${c};${status === 'offline' ? 'filter:grayscale(.6);opacity:.8;' : ''}" aria-hidden="true">
          ${beam}<use href="${symbolHref(type, mode)}"/>
        </svg>
      </div>
    </div>`;
}

export const FLEETIQ_MARKER_BOX = 84;
