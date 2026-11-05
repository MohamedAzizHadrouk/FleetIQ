/** Map basemap / overlay types for Suivi map controls */

export type BasemapType = 'plan' | 'osm' | 'satellite' | 'tunav';

export type DrawMode = null | 'geofence' | 'location' | 'route' | 'polygon';

export type ManageOverlayKind =
  | 'location'
  | 'route'
  | 'polygon'
  | 'geofence'
  | 'defaultZone';

export type GeofenceShapeType =
  | 'circulaire'
  | 'rectangulaire'
  | 'gouvernorat';

/** hors_zone = sortie, dans_zone = entrée, les_deux = both */
export type GeofenceAlertType = 'hors_zone' | 'dans_zone' | 'les_deux';

export type AssignmentMode = 'vehicle' | 'department';

export interface AssignmentScope {
  mode: AssignmentMode;
  ids: string[];
}

export function emptyAssignment(
  mode: AssignmentMode = 'vehicle'
): AssignmentScope {
  return { mode, ids: [] };
}

/** Who can see a geo overlay on the map */
export type GeoVisibility =
  | { mode: 'all' }
  | { mode: 'private' }
  | { mode: 'accounts'; accountIds: string[] };

export function defaultGeoVisibility(): GeoVisibility {
  return { mode: 'all' };
}

export const GEOFENCE_ALERT_LABELS: Record<GeofenceAlertType, string> = {
  hors_zone: 'Sortie',
  dans_zone: 'Entrée',
  les_deux: 'Entrée et sortie',
};

export type LatLng = [number, number]; // [lat, lng]

export interface GeofenceOverlay {
  id: string;
  kind: 'geofence';
  name: string;
  /** @deprecated prefer assignment — kept for legacy single-vehicle display */
  vehicleId: string;
  assignment: AssignmentScope;
  shapeType: GeofenceShapeType;
  alertType: GeofenceAlertType;
  radiusKm: number;
  center: LatLng;
  /** Set when shapeType is gouvernorat */
  provinceId?: string;
  visibility: GeoVisibility;
  visible: boolean;
}

export interface LocationOverlay {
  id: string;
  kind: 'location';
  name: string;
  position: LatLng;
  assignment?: AssignmentScope;
  alertType?: GeofenceAlertType;
  visibility?: GeoVisibility;
  visible: boolean;
}

export interface RouteOverlay {
  id: string;
  kind: 'route';
  name: string;
  /** Road-following geometry (OSRM) or straight waypoints */
  points: LatLng[];
  /** Original waypoint pins before OSRM expansion */
  waypoints?: LatLng[];
  waypointLocationIds?: string[];
  distanceMeters?: number;
  durationSeconds?: number;
  assignment?: AssignmentScope;
  alertType?: GeofenceAlertType;
  visibility?: GeoVisibility;
  visible: boolean;
}

export interface PolygonOverlay {
  id: string;
  kind: 'polygon';
  name: string;
  points: LatLng[];
  assignment?: AssignmentScope;
  alertType?: GeofenceAlertType;
  visibility?: GeoVisibility;
  visible: boolean;
}

export interface DefaultZoneOverlay {
  id: string;
  kind: 'defaultZone';
  name: string;
  countryCode: string;
  points: LatLng[];
  assignment?: AssignmentScope;
  alertType?: GeofenceAlertType;
  visible: boolean;
  readonly: true;
}

export type MapOverlay =
  | GeofenceOverlay
  | LocationOverlay
  | RouteOverlay
  | PolygonOverlay
  | DefaultZoneOverlay;

export interface GeofenceDraft {
  assignment: AssignmentScope;
  name: string;
  shapeType: GeofenceShapeType;
  alertType: GeofenceAlertType;
  radiusKm: number;
  center: LatLng;
  /** Set when shapeType is gouvernorat */
  provinceId?: string;
  visibility: GeoVisibility;
}

export interface OverlayFormDraft {
  name: string;
  assignment: AssignmentScope;
  alertType: GeofenceAlertType;
  visibility: GeoVisibility;
  points: LatLng[];
  /** For location edit/create */
  position?: LatLng;
  /** Route metrics */
  distanceMeters?: number;
  durationSeconds?: number;
  waypointLocationIds?: string[];
  waypoints?: LatLng[];
}

export interface LocationFormState {
  name: string;
  position: LatLng;
  visibility: GeoVisibility;
}

export const ACCOUNT_COUNTRY_CODE = 'TN';

export const BASEMAP_TILES: Record<
  BasemapType,
  { url: string; attribution: string; label: string }
> = {
  plan: {
    label: 'Plan',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  osm: {
    label: 'OSM',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    label: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
  tunav: {
    label: 'TUNAV',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      'TUNAV &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Approximate rectangle bounds from center + radius in km (half-side = radius) */
export function rectangleBoundsFromCenter(
  center: LatLng,
  radiusKm: number
): [[number, number], [number, number]] {
  const [lat, lng] = center;
  const dLat = radiusKm / 111;
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return [
    [lat - dLat, lng - dLng],
    [lat + dLat, lng + dLng],
  ];
}

function boundsCorners(
  bounds: [[number, number], [number, number]]
): LatLng[] {
  const [[south, west], [north, east]] = bounds;
  return [
    [south, west],
    [south, east],
    [north, east],
    [north, west],
  ];
}

/** Points for map.fitBounds when editing or framing a geofence */
export function getGeofenceFitPoints(
  g: GeofenceOverlay,
  options?: { provincePoints?: LatLng[] }
): LatLng[] {
  if (g.shapeType === 'gouvernorat') {
    if (options?.provincePoints?.length) return options.provincePoints;
    return boundsCorners(rectangleBoundsFromCenter(g.center, g.radiusKm));
  }
  return boundsCorners(rectangleBoundsFromCenter(g.center, g.radiusKm));
}

export function formatRouteDistance(meters?: number): string {
  if (meters == null || !Number.isFinite(meters)) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} km`;
}

export function formatRouteDuration(seconds?: number): string {
  if (seconds == null || !Number.isFinite(seconds)) return '—';
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function midpointOfPolyline(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];
  let total = 0;
  const segs: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const [lat1, lng1] = points[i - 1];
    const [lat2, lng2] = points[i];
    const d = Math.hypot(lat2 - lat1, lng2 - lng1);
    segs.push(d);
    total += d;
  }
  if (total === 0) return points[Math.floor(points.length / 2)];
  let acc = 0;
  const half = total / 2;
  for (let i = 0; i < segs.length; i++) {
    if (acc + segs[i] >= half) {
      const t = (half - acc) / segs[i];
      const [lat1, lng1] = points[i];
      const [lat2, lng2] = points[i + 1];
      return [lat1 + (lat2 - lat1) * t, lng1 + (lng2 - lng1) * t];
    }
    acc += segs[i];
  }
  return points[points.length - 1];
}
