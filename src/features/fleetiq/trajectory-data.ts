import type { Vehicle } from '@/types';
import { getRoadRoute, roadProgress } from './road-position';
import { buildReplayTimeline, replayAt } from './trip-replay';

/**
 * One coherent trajectory per vehicle, built on its real road route (OSRM):
 * alternating Stop / Circulation segments with timestamps, positions and
 * speed samples. The trajectory table, map markers, replay animation, speed
 * chart and the details panel all read from this single source.
 */

type LatLng = [number, number];

export type SegmentKind = 'Stop' | 'Circulation';

export interface TrajSegment {
  id: string;
  vehicleId: string;
  kind: SegmentKind;
  start: Date;
  end: Date;
  durationMin: number;
  distanceKm: number;
  avgSpeed: number;
  maxSpeed: number;
  /** Stop: where it stood. Circulation: where it ended. */
  position: LatLng;
  /** Road geometry driven during the segment (single point for a stop) */
  path: LatLng[];
  place: string;
}

export interface TrajSample {
  /** epoch ms */
  t: number;
  speed: number;
  point: LatLng;
  heading: number;
}

export interface TrajSummary {
  distanceKm: number;
  stopMin: number;
  runMin: number;
  stops: number;
  /** Share of time spent driving (%) */
  trafficRate: number;
  avgConsumption: number;
  totalFuel: number;
  maxSpeed: number;
  avgSpeed: number;
  driver: string;
}

export interface VehicleTrajectory {
  vehicleId: string;
  segments: TrajSegment[];
  samples: TrajSample[];
  path: LatLng[];
  start: Date;
  end: Date;
  summary: TrajSummary;
  from: string;
  to: string;
}

function seedOf(id: string): number {
  return Array.from(id).reduce((v, ch) => (Math.imul(v, 31) + ch.charCodeAt(0)) >>> 0, 7);
}

function km(a: LatLng, b: LatLng) {
  const dLat = (b[0] - a[0]) * 111.2;
  const dLng = (b[1] - a[1]) * 111.2 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

const cache = new Map<string, VehicleTrajectory>();
/** Anchor so the demo stays stable for the whole session */
const NOW = Date.now();

export function getVehicleTrajectory(vehicle: Vehicle): VehicleTrajectory | null {
  const key = `${vehicle.id}:${vehicle.status}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const route = getRoadRoute(vehicle.id);
  if (!route || route.path.length < 2) return null;

  const s = seedOf(vehicle.id);
  const progress = roadProgress(vehicle);
  const live = vehicle.status === 'active' && progress < 1;
  const timeline = buildReplayTimeline(route.path, route.durationMin);
  const endMin = timeline.totalMin * progress;

  // Split the driven part into 2–4 runs separated by stops
  const runs = 2 + (s % 3);
  const cuts = [0];
  for (let i = 1; i < runs; i++) cuts.push((endMin * i) / runs + ((((s >> i) % 7) - 3) / 100) * endMin);
  cuts.push(endMin);

  const stopLen = (i: number) => 6 + ((s >> (i + 1)) % 40); // minutes
  const firstStop = 45 + (s % 150);
  const lastStop = live ? 0 : 20 + ((s >> 3) % 120);

  // Real-clock layout ending now
  const runMins = cuts.slice(1).map((c, i) => c - cuts[i]);
  const midStops = Array.from({ length: runs - 1 }, (_, i) => stopLen(i));
  const total = firstStop + runMins.reduce((a, b) => a + b, 0) + midStops.reduce((a, b) => a + b, 0) + lastStop;
  let clock = NOW - total * 60000;

  const segments: TrajSegment[] = [];
  const samples: TrajSample[] = [];
  let segIdx = 0;
  const pushStop = (minutes: number, at: LatLng, place: string) => {
    if (minutes <= 0) return;
    const start = new Date(clock);
    clock += minutes * 60000;
    segments.push({
      id: `trj-${vehicle.id}-${segIdx++}`,
      vehicleId: vehicle.id,
      kind: 'Stop',
      start,
      end: new Date(clock),
      durationMin: minutes,
      distanceKm: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      position: at,
      path: [at],
      place,
    });
    samples.push({ t: start.getTime(), speed: 0, point: at, heading: 0 }, { t: clock, speed: 0, point: at, heading: 0 });
  };

  pushStop(firstStop, route.path[0], route.from);
  for (let r = 0; r < runs; r++) {
    const a = cuts[r];
    const b = cuts[r + 1];
    const start = new Date(clock);
    const path: LatLng[] = [];
    let maxSpeed = 0;
    let speedSum = 0;
    let n = 0;
    for (let m = a; m <= b + 1e-6; m += Math.max(0.25, (b - a) / 120)) {
      const st = replayAt(timeline, Math.min(m, b));
      const speed = Math.min(130, st.speedKmh);
      path.push(st.point);
      samples.push({ t: clock + (m - a) * 60000, speed, point: st.point, heading: st.heading });
      maxSpeed = Math.max(maxSpeed, speed);
      speedSum += speed;
      n++;
    }
    const endState = replayAt(timeline, b);
    clock += (b - a) * 60000;
    const distanceKm = replayAt(timeline, b).km - replayAt(timeline, a).km;
    const isLastLive = live && r === runs - 1;
    segments.push({
      id: `trj-${vehicle.id}-${segIdx++}`,
      vehicleId: vehicle.id,
      kind: 'Circulation',
      start,
      end: new Date(clock),
      durationMin: b - a,
      distanceKm,
      avgSpeed: n ? Math.round(speedSum / n) : 0,
      maxSpeed: Math.round(maxSpeed),
      position: endState.point,
      path,
      place: isLastLive ? `${route.from} → ${route.to} (en cours)` : `${route.from} → ${route.to}`,
    });
    if (r < runs - 1) pushStop(midStops[r], endState.point, `Arrêt · ${route.from} → ${route.to}`);
  }
  if (!live) pushStop(lastStop, replayAt(timeline, endMin).point, route.to);

  const driven = segments.filter((g) => g.kind === 'Circulation');
  const stopsOnly = segments.filter((g) => g.kind === 'Stop');
  const distanceKm = driven.reduce((acc, g) => acc + g.distanceKm, 0);
  const runMin = driven.reduce((acc, g) => acc + g.durationMin, 0);
  const stopMin = stopsOnly.reduce((acc, g) => acc + g.durationMin, 0);
  const avgConsumption = (64 + (s % 38)) / 10;
  const fullPath = driven.flatMap((g) => g.path);

  const traj: VehicleTrajectory = {
    vehicleId: vehicle.id,
    segments,
    samples: samples.sort((x, y) => x.t - y.t),
    path: fullPath,
    start: segments[0].start,
    end: segments[segments.length - 1].end,
    from: route.from,
    to: route.to,
    summary: {
      distanceKm,
      stopMin,
      runMin,
      stops: stopsOnly.length,
      trafficRate: runMin + stopMin ? (runMin / (runMin + stopMin)) * 100 : 0,
      avgConsumption,
      totalFuel: (distanceKm * avgConsumption) / 100,
      maxSpeed: Math.max(0, ...driven.map((g) => g.maxSpeed)),
      avgSpeed: runMin ? Math.round((distanceKm / runMin) * 60) : 0,
      driver: vehicle.driver || '',
    },
  };
  cache.set(key, traj);
  return traj;
}

/** "hh:mm:ss" from minutes */
export function formatHms(min: number): string {
  const total = Math.round(min * 60);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const sec = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export { km as kmBetweenPoints };

/** What the map highlights when a trajectory row / chart point is selected */
export interface TrajectoryFocus {
  vehicleId: string;
  kind: SegmentKind | 'Point' | 'Alert';
  /** Alert table: what was raised (shown with its own icon, not the vehicle) */
  alert?: {
    type: string;
    vehicle: string;
    date: string;
    speed: string;
    mileage: string;
    driver?: string;
  };
  position: LatLng;
  /** epoch ms */
  time: number;
  speed: number;
  place?: string;
  durationMin?: number;
  /** Road driven during a Circulation segment (highlighted) */
  path?: LatLng[];
}

/** One vehicle trajectory drawn on the map in the trajectory view */
export interface TrajectoryLayer {
  vehicleId: string;
  label: string;
  color: string;
  path: LatLng[];
  /** Stop & Circulation view: every stop of the vehicle, drawn as a STOP icon */
  stops?: { id: string; position: LatLng; start: number; durationMin: number; place: string }[];
  /** Stop & Circulation view: each driving segment drawn separately */
  runs?: LatLng[][];
}

/** Distinct, design-system friendly colours for several trajectories at once */
export const TRAJECTORY_COLORS = ['#2F6BFF', '#16A34A', '#F59E0B', '#8B5CF6', '#E5484D', '#0EA5E9', '#DB2777', '#0F766E'];
