/**
 * Trip replay timeline: turns a road path + real trip duration into a
 * time-parameterised motion where the vehicle slows in bends, cruises on
 * straights and accelerates / brakes at both ends.
 */

type LatLng = [number, number];

export interface ReplayTimeline {
  path: LatLng[];
  /** Cumulative simulated time (minutes) at each vertex */
  times: number[];
  /** Cumulative distance (km) at each vertex */
  dist: number[];
  totalMin: number;
  totalKm: number;
}

export interface ReplayState {
  point: LatLng;
  heading: number;
  /** Simulated speed at this instant (km/h) */
  speedKmh: number;
  /** Distance driven so far (km) */
  km: number;
  /** Simulated minutes since departure */
  minutes: number;
  /** Index of the segment the vehicle is on (for the travelled polyline) */
  segment: number;
}

function km(a: LatLng, b: LatLng) {
  const dLat = (b[0] - a[0]) * 111.2;
  const dLng = (b[1] - a[1]) * 111.2 * Math.cos((a[0] * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

function bearing(a: LatLng, b: LatLng) {
  const φ1 = (a[0] * Math.PI) / 180;
  const φ2 = (b[0] * Math.PI) / 180;
  const Δλ = ((b[1] - a[1]) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function turnAngle(a: LatLng, b: LatLng, c: LatLng) {
  const d = Math.abs(bearing(a, b) - bearing(b, c)) % 360;
  return d > 180 ? 360 - d : d;
}

export function buildReplayTimeline(path: LatLng[], durationMin: number): ReplayTimeline {
  const pts = path.length >= 2 ? path : [path[0], path[0]];
  const lens = pts.slice(1).map((p, i) => km(pts[i], p));
  const totalKm = lens.reduce((s, l) => s + l, 0) || 0.001;

  // Relative speed per segment: slower around sharp turns and near both ends.
  let run = 0;
  const rel = lens.map((len, i) => {
    const prevTurn = i > 0 ? turnAngle(pts[i - 1], pts[i], pts[i + 1]) : 0;
    const nextTurn = i + 2 < pts.length ? turnAngle(pts[i], pts[i + 1], pts[i + 2]) : 0;
    const bend = Math.max(prevTurn, nextTurn);
    const curve = 1 - Math.min(0.6, bend / 150); // 90° turn ≈ 0.4 slower
    const mid = run + len / 2;
    run += len;
    const edge = Math.min(mid, totalKm - mid);
    const ramp = Math.min(1, 0.35 + edge / 0.6); // accelerate / brake over ~400 m
    const long = Math.min(1.25, 0.85 + len / 4); // long straight segments → faster roads
    return Math.max(0.15, curve * ramp * long);
  });

  // Time per segment ∝ length / relative speed, scaled to the real trip duration.
  const raw = lens.map((l, i) => l / rel[i]);
  const rawTotal = raw.reduce((s, t) => s + t, 0) || 1;
  const totalMin = Math.max(1, durationMin);
  const times = [0];
  const dist = [0];
  raw.forEach((t, i) => {
    times.push(times[i] + (t / rawTotal) * totalMin);
    dist.push(dist[i] + lens[i]);
  });
  return { path: pts, times, dist, totalMin, totalKm };
}

/** State at simulated minute `m` (clamped). */
export function replayAt(tl: ReplayTimeline, m: number): ReplayState {
  const t = Math.min(tl.totalMin, Math.max(0, m));
  let i = 0;
  while (i < tl.times.length - 2 && tl.times[i + 1] < t) i++;
  const a = tl.path[i];
  const b = tl.path[i + 1];
  const segMin = tl.times[i + 1] - tl.times[i] || 1e-6;
  const f = Math.min(1, Math.max(0, (t - tl.times[i]) / segMin));
  const segKm = tl.dist[i + 1] - tl.dist[i];
  return {
    point: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
    heading: Math.round(bearing(a, b)),
    speedKmh: Math.round((segKm / segMin) * 60),
    km: tl.dist[i] + segKm * f,
    minutes: t,
    segment: i,
  };
}
