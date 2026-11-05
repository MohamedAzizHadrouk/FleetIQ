import type { DefaultZoneOverlay, LatLng } from '../types/map-overlays';
import { ACCOUNT_COUNTRY_CODE } from '../types/map-overlays';

/**
 * Simplified Tunisian governorate polygons for demo geofencing.
 * Approximate bounding rings — enough for map fill / fly-to (not cadastral).
 */
interface ProvinceDef {
  id: string;
  name: string;
  /** [south, west, north, east] approx bounds → rectangle ring */
  bounds: [number, number, number, number];
}

export interface TunisiaProvince {
  id: string;
  name: string;
  points: LatLng[];
}

function ringFromBounds(
  south: number,
  west: number,
  north: number,
  east: number
): LatLng[] {
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
  ];
}

const PROVINCES: ProvinceDef[] = [
  { id: 'tn-tunis', name: 'Tunis', bounds: [36.72, 10.05, 36.92, 10.35] },
  { id: 'tn-ariana', name: 'Ariana', bounds: [36.82, 10.05, 37.05, 10.35] },
  { id: 'tn-ben-arous', name: 'Ben Arous', bounds: [36.55, 10.05, 36.78, 10.45] },
  { id: 'tn-manouba', name: 'Manouba', bounds: [36.7, 9.75, 36.92, 10.1] },
  { id: 'tn-nabeul', name: 'Nabeul', bounds: [36.35, 10.35, 37.1, 11.15] },
  { id: 'tn-zaghouan', name: 'Zaghouan', bounds: [36.15, 9.7, 36.55, 10.35] },
  { id: 'tn-bizerte', name: 'Bizerte', bounds: [36.9, 9.35, 37.4, 10.3] },
  { id: 'tn-beja', name: 'Béja', bounds: [36.35, 8.85, 37.0, 9.7] },
  { id: 'tn-jendouba', name: 'Jendouba', bounds: [36.35, 8.35, 36.95, 9.1] },
  { id: 'tn-kef', name: 'Le Kef', bounds: [35.75, 8.35, 36.45, 9.15] },
  { id: 'tn-siliana', name: 'Siliana', bounds: [35.7, 9.0, 36.35, 9.75] },
  { id: 'tn-kairouan', name: 'Kairouan', bounds: [35.2, 9.4, 36.0, 10.35] },
  { id: 'tn-kasserine', name: 'Kasserine', bounds: [34.85, 8.2, 35.75, 9.3] },
  { id: 'tn-sidi-bouzid', name: 'Sidi Bouzid', bounds: [34.55, 8.95, 35.55, 9.95] },
  { id: 'tn-sousse', name: 'Sousse', bounds: [35.55, 10.2, 36.2, 10.75] },
  { id: 'tn-monastir', name: 'Monastir', bounds: [35.5, 10.55, 35.85, 11.05] },
  { id: 'tn-mahdia', name: 'Mahdia', bounds: [35.15, 10.35, 35.6, 11.15] },
  { id: 'tn-sfax', name: 'Sfax', bounds: [34.35, 10.0, 35.2, 11.15] },
  { id: 'tn-gafsa', name: 'Gafsa', bounds: [34.05, 8.2, 34.85, 9.45] },
  { id: 'tn-tozeur', name: 'Tozeur', bounds: [33.55, 7.55, 34.35, 8.55] },
  { id: 'tn-kebili', name: 'Kébili', bounds: [33.0, 8.2, 34.2, 9.55] },
  { id: 'tn-gabes', name: 'Gabès', bounds: [33.45, 9.55, 34.25, 10.55] },
  { id: 'tn-medinine', name: 'Médenine', bounds: [32.7, 10.0, 33.7, 11.4] },
  { id: 'tn-tataouine', name: 'Tataouine', bounds: [31.5, 9.5, 33.1, 11.0] },
];

export const TUNISIA_PROVINCES: TunisiaProvince[] = PROVINCES.map((p) => {
  const [south, west, north, east] = p.bounds;
  return {
    id: p.id,
    name: p.name,
    points: ringFromBounds(south, west, north, east),
  };
});

export function getTunisiaProvince(id: string): TunisiaProvince | undefined {
  return TUNISIA_PROVINCES.find((p) => p.id === id);
}

export function provinceCentroid(points: LatLng[]): LatLng {
  if (points.length === 0) return [36.8, 10.18];
  const lat = points.reduce((s, p) => s + p[0], 0) / points.length;
  const lng = points.reduce((s, p) => s + p[1], 0) / points.length;
  return [lat, lng];
}

export function createTunisiaDefaultZones(): DefaultZoneOverlay[] {
  return TUNISIA_PROVINCES.map((p) => ({
    id: p.id,
    kind: 'defaultZone' as const,
    name: p.name,
    countryCode: ACCOUNT_COUNTRY_CODE,
    points: p.points,
    visible: false,
    readonly: true as const,
  }));
}

export const TUNISIA_PROVINCE_COUNT = TUNISIA_PROVINCES.length;
