import { ROAD_ROUTES, type RoadRoute } from '@/data/road-routes';
import type { Vehicle } from '@/types';

/**
 * Places demo vehicles on real roads using the generated OSRM routes
 * (src/data/road-routes.ts). Moving vehicles sit part-way along their route;
 * stopped / offline vehicles are parked at the destination.
 */

type LatLng = [number, number];

function seedOf(id: string): number {
  return Array.from(id).reduce((v, ch) => (Math.imul(v, 31) + ch.charCodeAt(0)) >>> 0, 7);
}

function segLen(a: LatLng, b: LatLng): number {
  const dLat = b[0] - a[0];
  const dLng = (b[1] - a[1]) * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

/** Compass bearing a → b in degrees (0 = north, clockwise). */
function bearing(a: LatLng, b: LatLng): number {
  const φ1 = (a[0] * Math.PI) / 180;
  const φ2 = (b[0] * Math.PI) / 180;
  const Δλ = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Point at fraction t (0–1) of the path length, with road heading and the track up to it. */
function along(path: LatLng[], t: number): { point: LatLng; heading: number; track: LatLng[] } {
  if (path.length < 2) return { point: path[0], heading: 0, track: path };
  const lengths = path.slice(1).map((p, i) => segLen(path[i], p));
  const total = lengths.reduce((s, l) => s + l, 0);
  let remaining = Math.min(1, Math.max(0, t)) * total;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? Math.min(1, remaining / lengths[i]) : 0;
      const a = path[i];
      const b = path[i + 1];
      const point: LatLng = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
      return { point, heading: Math.round(bearing(a, b)), track: [...path.slice(0, i + 1), point] };
    }
    remaining -= lengths[i];
  }
  const last = path[path.length - 1];
  return { point: last, heading: Math.round(bearing(path[path.length - 2], last)), track: path };
}

export function getRoadRoute(vehicleId: string): RoadRoute | undefined {
  return ROAD_ROUTES[vehicleId];
}

/** Progress along the route: moving 25–90 %, otherwise arrived. */
function progressFor(vehicle: Pick<Vehicle, 'id' | 'status'>): number {
  if (vehicle.status !== 'active') return 1;
  return 0.25 + (seedOf(vehicle.id) % 66) / 100;
}

/** Real road position + heading for a vehicle, or null when it has no route. */
export function roadPlacement(vehicle: Pick<Vehicle, 'id' | 'status'>) {
  const route = ROAD_ROUTES[vehicle.id];
  if (!route) return null;
  const { point, heading } = along(route.path, progressFor(vehicle));
  return { coordinates: point, heading, route };
}

/** GPS track driven so far on the current trip (origin → current position). */
export function roadTrack(vehicle: Pick<Vehicle, 'id' | 'status'>): LatLng[] | null {
  const route = ROAD_ROUTES[vehicle.id];
  if (!route) return null;
  return along(route.path, progressFor(vehicle)).track;
}

/** Share of the current route already driven (1 = arrived). */
export function roadProgress(vehicle: Pick<Vehicle, 'id' | 'status'>): number {
  return progressFor(vehicle);
}

export interface RoadEdge {
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  path: LatLng[];
}

let edgesCache: RoadEdge[] | null = null;

/** Every distinct generated route, in both directions — the demo road network. */
export function roadEdges(): RoadEdge[] {
  if (edgesCache) return edgesCache;
  const seen = new Set<string>();
  const out: RoadEdge[] = [];
  for (const r of Object.values(ROAD_ROUTES)) {
    for (const e of [
      { from: r.from, to: r.to, path: r.path },
      { from: r.to, to: r.from, path: [...r.path].reverse() },
    ]) {
      const key = `${e.from}>${e.to}`;
      if (seen.has(key) || e.from === e.to) continue;
      seen.add(key);
      out.push({ ...e, distanceKm: r.distanceKm, durationMin: r.durationMin });
    }
  }
  edgesCache = out;
  return out;
}

/** Approximate distance in km between two points (equirectangular). */
export function kmBetween(a: LatLng, b: LatLng): number {
  return segLen(a, b) * 111;
}
