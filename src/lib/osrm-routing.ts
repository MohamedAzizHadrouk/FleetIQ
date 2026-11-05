import type { LatLng } from '../types/map-overlays';
import { haversineMeters } from './polygon-geometry';

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

interface OsrmRouteResponse {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: [number, number][];
    };
  }>;
}

export interface DrivingRouteResult {
  geometry: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
}

function straightFallback(waypoints: LatLng[]): DrivingRouteResult {
  let distanceMeters = 0;
  for (let i = 1; i < waypoints.length; i++) {
    distanceMeters += haversineMeters(waypoints[i - 1], waypoints[i]);
  }
  // Assume ~40 km/h average for fallback ETA
  const durationSeconds = distanceMeters > 0 ? (distanceMeters / 40000) * 3600 : 0;
  return { geometry: waypoints, distanceMeters, durationSeconds };
}

/**
 * Fetch a road-following driving route between waypoints via public OSRM.
 * Returns straight-line fallback on error or if fewer than 2 points.
 */
export async function fetchDrivingRoute(
  waypoints: LatLng[]
): Promise<DrivingRouteResult> {
  if (waypoints.length < 2) {
    return { geometry: waypoints, distanceMeters: 0, durationSeconds: 0 };
  }

  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(';');
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) return straightFallback(waypoints);
    const data = (await res.json()) as OsrmRouteResponse;
    const route = data.routes?.[0];
    if (
      data.code !== 'Ok' ||
      !route?.geometry?.coordinates?.length
    ) {
      return straightFallback(waypoints);
    }
    return {
      geometry: route.geometry.coordinates.map(
        ([lng, lat]) => [lat, lng] as LatLng
      ),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
    };
  } catch {
    return straightFallback(waypoints);
  }
}
