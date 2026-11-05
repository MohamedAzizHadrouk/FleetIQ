import type { Vehicle } from '@/types';
import type { AlertType, FleetAlert } from '@/types/alerts';
import { getAlertStore, initAlertStore } from '@/features/alert-center/api/alert-api';
import { getAlertTypeConfig } from '@/features/alert-center/constants/alert-type-registry';
import { isDocumentAlert } from '@/features/alert-center/constants/vehicle-inspector-sections';
import { getRoadRoute, kmBetween, roadEdges, roadProgress, roadTrack, type RoadEdge } from './road-position';

/**
 * Data for the map vehicle card. Alerts come from the shared alert store used by
 * the Alerts module (same ids, same states). Trips and maintenance are
 * deterministic demo values until those modules expose per-vehicle APIs.
 */

let storeFleet: Vehicle[] | null = null;

/** Make sure the alert store is populated for the fleet shown on the map. */
export function ensureAlertStore(fleet: Vehicle[]): void {
  if (getAlertStore().length > 0 || storeFleet === fleet || fleet.length === 0) return;
  storeFleet = fleet;
  initAlertStore(fleet);
}

export type CardAlertGroup =
  | 'critique'
  | 'documents'
  | 'maintenance'
  | 'moteur'
  | 'carburant'
  | 'zone'
  | 'conduite'
  | 'securite'
  | 'parc';

export const CARD_ALERT_GROUP_LABEL: Record<CardAlertGroup, string> = {
  critique: 'Critique',
  documents: 'Documents',
  maintenance: 'Maintenance',
  moteur: 'Moteur',
  carburant: 'Carburant',
  zone: 'Zone',
  conduite: 'Conduite',
  securite: 'Sécurité',
  parc: 'Parc',
};

const MAINTENANCE_TYPES = new Set<AlertType>([
  'maintenance',
  'maintenance_due',
  'oil_change',
  'brake_pads',
  'distribution_chain',
  'spark_plugs',
  'tires_change',
  'fuel_filter',
  'ac_filter',
  'oil_filter',
  'air_filter',
]);

const ENGINE_TYPES = new Set<AlertType>([
  'check_engine',
  'temperature',
  'engine_temperature',
  'oil_pressure',
  'oil_level',
  'coolant_level',
  'engine_overspeed',
]);

/** Fuel level drop: theft / siphoning, low and very low tank, low-fuel warning light */
const FUEL_DROP_TYPES = new Set<AlertType>(['fuel_theft', 'tank_low', 'tank_very_low', 'fuel']);

export interface CardAlert {
  id: string;
  group: CardAlertGroup;
  critical: boolean;
  title: string;
  message: string;
  when: string;
  raw: FleetAlert;
}

function groupOf(alert: FleetAlert): Exclude<CardAlertGroup, 'critique'> {
  if (isDocumentAlert(alert.type) || alert.type === 'car_document') return 'documents';
  if (MAINTENANCE_TYPES.has(alert.type)) return 'maintenance';
  if (ENGINE_TYPES.has(alert.type)) return 'moteur';
  if (FUEL_DROP_TYPES.has(alert.type)) return 'carburant';
  switch (alert.category) {
    case 'dashboard':
      return 'moteur';
    case 'geolocation':
      return 'zone';
    case 'driving_quality':
      return 'conduite';
    case 'security':
      return 'securite';
    default:
      return 'parc';
  }
}

export function getVehicleCardAlerts(vehicleId: string): CardAlert[] {
  return getAlertStore()
    .filter((a) => a.vehicleId === vehicleId && a.status !== 'resolved')
    .map((a) => {
      const group = groupOf(a);
      const critical = a.severity === 'critical';
      let label: string = a.type;
      try {
        label = getAlertTypeConfig(a.type).label;
      } catch {
        /* unknown type: keep raw id */
      }
      return {
        id: a.id,
        group,
        critical,
        title: `${critical ? 'Critique' : CARD_ALERT_GROUP_LABEL[group]} · ${label}`,
        message: a.message,
        when: a.timestamp,
        raw: a,
      };
    })
    .sort((a, b) => Number(b.critical) - Number(a.critical));
}

/** Vehicles with an active, unread critical alert are drawn in the alert colour. */
export function getCriticalAlertVehicleIds(): Set<string> {
  const ids = new Set<string>();
  for (const a of getAlertStore()) {
    if (a.status !== 'resolved' && !a.isRead && a.severity === 'critical') ids.add(a.vehicleId);
  }
  return ids;
}

function seedOf(id: string): number {
  return Array.from(id).reduce((v, ch) => (Math.imul(v, 31) + ch.charCodeAt(0)) >>> 0, 7);
}

export type TripRange = 'today' | 'yesterday' | 'week';

export interface DemoTrip {
  id: string;
  from: string;
  to: string;
  start: string;
  end: string;
  duration: string;
  durationMin: number;
  km: number;
  /** Real road geometry [lat, lng] from origin to destination (or current position) */
  path: [number, number][];
  /** Day label for multi-day ranges ("Lun. 03/11") */
  day?: string;
  /** Trip still in progress (vehicle moving on it right now) */
  live?: boolean;
}

function hhmm(totalMin: number) {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')}` : `${m} min`;
}

/**
 * Pick `count` real road trips ending at `anchor` (chained backwards: each trip
 * ends where the next one starts). Falls back to the nearest route when the
 * network has no direct link.
 */
function chainTripsTo(anchor: string, anchorPoint: [number, number], count: number, seed: number): RoadEdge[] {
  const edges = roadEdges();
  const chain: RoadEdge[] = [];
  let place = anchor;
  let point = anchorPoint;
  for (let k = 0; k < count; k++) {
    let options = edges.filter((e) => e.to === place && !chain.includes(e));
    if (!options.length) {
      options = [...edges]
        .filter((e) => !chain.includes(e))
        .sort((a, b) => kmBetween(a.path[a.path.length - 1], point) - kmBetween(b.path[b.path.length - 1], point))
        .slice(0, 3);
    }
    if (!options.length) break;
    const pick = options[(seed >> k) % options.length];
    chain.unshift(pick);
    place = pick.from;
    point = pick.path[0];
  }
  return chain;
}

const DAY_FMT = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: '2-digit', month: '2-digit' });

export function getDemoTrips(vehicle: Vehicle, range: TripRange): DemoTrip[] {
  const seed = seedOf(vehicle.id) + (range === 'today' ? 0 : range === 'yesterday' ? 101 : 211);
  const own = getRoadRoute(vehicle.id);
  if (!own) return [];
  const ownStart = own.path[0];

  type Leg = { edge: RoadEdge; live?: boolean; path: [number, number][]; km: number; min: number };
  const legs: Leg[] = [];
  if (range === 'today') {
    const before = chainTripsTo(own.from, ownStart, 1 + (seed % 3), seed);
    before.forEach((e) => legs.push({ edge: e, path: e.path, km: e.distanceKm, min: e.durationMin }));
    const progress = roadProgress(vehicle);
    const live = vehicle.status === 'active' && progress < 1;
    legs.push({
      edge: { ...own, path: own.path },
      live,
      path: live ? (roadTrack(vehicle) ?? own.path) : own.path,
      km: Math.round(own.distanceKm * progress * 10) / 10,
      min: Math.max(1, Math.round(own.durationMin * progress)),
    });
  } else {
    const n = range === 'week' ? 6 + (seed % 4) : 2 + (seed % 3);
    chainTripsTo(own.from, ownStart, n, seed).forEach((e) =>
      legs.push({ edge: e, path: e.path, km: e.distanceKm, min: e.durationMin })
    );
  }

  const trips: DemoTrip[] = [];
  const now = new Date(Date.UTC(2026, 8, 28, 9, 30));
  let clock = 5 * 60 + 40 + (seed % 50);
  let dayOffset = range === 'week' ? Math.min(6, legs.length - 1) : range === 'yesterday' ? 1 : 0;
  legs.forEach((leg, i) => {
    if (range === 'week' && i > 0 && clock > 17 * 60) {
      dayOffset = Math.max(1, dayOffset - 1);
      clock = 6 * 60 + ((seed >> i) % 60);
    }
    const start = clock;
    trips.push({
      id: `${vehicle.id}-${range}-${i}`,
      from: leg.edge.from,
      to: leg.live ? `${leg.edge.to} (en route)` : leg.edge.to,
      start: hhmm(start),
      end: leg.live ? 'en cours' : hhmm(start + leg.min),
      duration: formatDuration(leg.min),
      durationMin: leg.min,
      km: Math.round(leg.km),
      path: leg.path,
      live: leg.live,
      day: range === 'week' ? DAY_FMT.format(new Date(now.getTime() - dayOffset * 86400000)) : undefined,
    });
    clock = start + leg.min + 12 + ((seed >> i) % 35);
  });
  return trips;
}

export interface DemoService {
  label: string;
  remainingKm: number;
  /** 0–1, share of the interval already used */
  used: number;
}

export interface DemoDocument {
  label: string;
  days: number; // negative = expired since |days|
}

export function getDemoMaintenance(vehicle: Vehicle): { services: DemoService[]; documents: DemoDocument[] } {
  const s = seedOf(vehicle.id);
  const services: DemoService[] = [
    { label: 'Vidange moteur', remainingKm: 600 + (s % 9) * 200, used: 0 },
    { label: 'Pneus', remainingKm: 9000 + (s % 12) * 600, used: 0 },
    { label: 'Plaquettes de frein', remainingKm: 3000 + (s % 10) * 500, used: 0 },
  ];
  const intervals = [10000, 40000, 15000];
  services.forEach((sv, i) => {
    sv.used = Math.min(1, Math.max(0, 1 - sv.remainingKm / intervals[i]));
  });
  const documents: DemoDocument[] = [
    { label: 'Visite technique', days: -1 - (s % 12) },
    { label: 'Assurance', days: 5 + (s % 25) },
  ];
  return { services, documents };
}
