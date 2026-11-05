#!/usr/bin/env node
/**
 * Generates src/data/road-routes.ts: one real driving route per demo vehicle,
 * fetched from the public OSRM server (OpenStreetMap roads, Tunisia).
 * Vehicle positions, headings and trip tracks on the map are derived from these
 * routes, so every vehicle sits on an actual road (never in the sea).
 *
 * Run: node scripts/generate-road-routes.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const OSRM = 'https://router.project-osrm.org/route/v1/driving';

/** Real places (on land, near a road; OSRM snaps to the closest road). */
const P = {
  tunis: ['Tunis Centre', 36.7992, 10.1805],
  marsa: ['La Marsa', 36.8781, 10.3247],
  ariana: ['Ariana', 36.8601, 10.1934],
  benarous: ['Ben Arous', 36.7531, 10.2189],
  charguia: ['Charguia', 36.8405, 10.2045],
  aeroport: ['Aéroport Tunis-Carthage', 36.8475, 10.2195],
  goulette: ['La Goulette', 36.8185, 10.3015],
  carthage: ['Carthage', 36.8525, 10.3235],
  kram: ['Le Kram', 36.8338, 10.3156],
  lac1: ['Lac 1', 36.8335, 10.2335],
  manouba: ['Manouba', 36.8101, 10.0956],
  mornag: ['Mornag', 36.6835, 10.2885],
  bizerte: ['Bizerte', 37.2744, 9.8739],
  rasjebel: ['Ras Jebel', 37.2145, 10.1238],
  rafraf: ['Rafraf', 37.1905, 10.1835],
  ghar: ['Ghar El Melh', 37.1695, 10.1905],
  metline: ['Metline', 37.2455, 10.0555],
  menzeljemil: ['Menzel Jemil', 37.2375, 9.9155],
  menzelbourguiba: ['Menzel Bourguiba', 37.1536, 9.7856],
  mateur: ['Mateur', 37.0405, 9.6655],
  sousse: ['Sousse', 35.8256, 10.6311],
  monastir: ['Monastir', 35.7705, 10.8155],
  msaken: ['Msaken', 35.7305, 10.5805],
  enfidha: ['Enfidha', 36.1305, 10.3805],
  sfax: ['Sfax Centre', 34.7406, 10.7553],
  sfaxnord: ['Sfax Nord', 34.7805, 10.7205],
  mahdia: ['Mahdia', 35.5047, 11.0522],
  nabeul: ['Nabeul', 36.4561, 10.7336],
  hammamet: ['Hammamet', 36.4005, 10.6167],
  grombalia: ['Grombalia', 36.5985, 10.4985],
  soliman: ['Soliman', 36.6965, 10.4905],
  kairouan: ['Kairouan', 35.6781, 10.0963],
  zaghouan: ['Zaghouan', 36.4029, 10.1429],
  beja: ['Béja', 36.7256, 9.1817],
};

/** Showcase vehicles keep their story (see App.tsx). */
const SHOWCASE = {
  'v-1000': ['ariana', 'tunis'],
  'v-1001': ['bizerte', 'rasjebel'],
  'v-1002': ['tunis', 'marsa'],
  'v-1003': ['monastir', 'sousse'],
  'v-1004': ['ariana', 'aeroport'],
  'v-1005': ['tunis', 'lac1'],
  'v-1006': ['mateur', 'bizerte'],
  'v-1007': ['sfaxnord', 'sfax'],
  'v-rj-01': ['rafraf', 'rasjebel'],
  'v-rj-02': ['rasjebel', 'metline'],
  'v-rj-03': ['ghar', 'rasjebel'],
  'v-rj-04': ['menzeljemil', 'rasjebel'],
  'v-rj-05': ['rasjebel', 'rafraf'],
};

/** Pool for the generated vehicles (ids "14" … "55"). */
const POOL = [
  ['tunis', 'benarous'], ['marsa', 'carthage'], ['charguia', 'ariana'], ['goulette', 'kram'],
  ['manouba', 'tunis'], ['benarous', 'mornag'], ['lac1', 'goulette'], ['aeroport', 'charguia'],
  ['bizerte', 'menzelbourguiba'], ['rasjebel', 'bizerte'], ['tunis', 'hammamet'], ['nabeul', 'hammamet'],
  ['grombalia', 'nabeul'], ['soliman', 'grombalia'], ['sousse', 'msaken'], ['sousse', 'monastir'],
  ['enfidha', 'sousse'], ['monastir', 'mahdia'], ['sfax', 'sfaxnord'], ['kairouan', 'sousse'],
  ['zaghouan', 'tunis'], ['beja', 'mateur'], ['carthage', 'marsa'], ['ariana', 'manouba'],
];

const ids = [...Object.keys(SHOWCASE)];
for (let i = 14; i <= 55; i++) ids.push(String(i));

function perpendicularDistance(p, a, b) {
  const [x, y] = [p[1], p[0]];
  const [x1, y1] = [a[1], a[0]];
  const [x2, y2] = [b[1], b[0]];
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

/** Douglas–Peucker; tolerance in degrees (~1e-4 ≈ 10 m). */
function simplify(points, tol) {
  if (points.length < 3) return points;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > max) {
      max = d;
      idx = i;
    }
  }
  if (max <= tol) return [points[0], points[points.length - 1]];
  return [...simplify(points.slice(0, idx + 1), tol).slice(0, -1), ...simplify(points.slice(idx), tol)];
}

const cache = new Map();
async function route(fromKey, toKey) {
  const key = `${fromKey}>${toKey}`;
  if (cache.has(key)) return cache.get(key);
  const [, la1, lo1] = P[fromKey];
  const [, la2, lo2] = P[toKey];
  const url = `${OSRM}/${lo1},${la1};${lo2},${la2}?overview=full&geometries=geojson`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const r = data.routes?.[0];
      if (data.code === 'Ok' && r) {
        const full = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const pts = simplify(full, 0.00008).map(([a, b]) => [+a.toFixed(5), +b.toFixed(5)]);
        const out = {
          from: P[fromKey][0],
          to: P[toKey][0],
          distanceKm: Math.round(r.distance / 100) / 10,
          durationMin: Math.round(r.duration / 60),
          path: pts,
        };
        cache.set(key, out);
        await new Promise((s) => setTimeout(s, 400));
        return out;
      }
    }
    await new Promise((s) => setTimeout(s, 1500 * (attempt + 1)));
  }
  throw new Error(`OSRM failed for ${key}`);
}

const result = {};
for (const [n, id] of ids.entries()) {
  const pair = SHOWCASE[id] ?? POOL[(n * 7) % POOL.length];
  result[id] = await route(pair[0], pair[1]);
  process.stdout.write(`${id}: ${result[id].from} → ${result[id].to} (${result[id].path.length} pts)\n`);
}

const out = `/* eslint-disable */
// GENERATED by scripts/generate-road-routes.mjs — do not edit by hand.
// Real driving routes (OSRM / OpenStreetMap) used to place demo vehicles on roads.

export interface RoadRoute {
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
  /** [lat, lng] along the road, origin → destination */
  path: [number, number][];
}

export const ROAD_ROUTES: Record<string, RoadRoute> = ${JSON.stringify(result)};
`;
const target = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'road-routes.ts');
writeFileSync(target, out);
console.log(`\nWrote ${target} (${(out.length / 1024).toFixed(1)} KB)`);
