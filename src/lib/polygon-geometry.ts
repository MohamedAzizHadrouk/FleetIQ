import type { LatLng } from '../types/map-overlays';

/** Check if segments AB and CD properly intersect (not just share an endpoint). */
function segmentsIntersect(
  a: LatLng,
  b: LatLng,
  c: LatLng,
  d: LatLng
): boolean {
  const orient = (p: LatLng, q: LatLng, r: LatLng) => {
    const v = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
    if (Math.abs(v) < 1e-14) return 0;
    return v > 0 ? 1 : 2;
  };
  const onSegment = (p: LatLng, q: LatLng, r: LatLng) =>
    q[0] <= Math.max(p[0], r[0]) + 1e-12 &&
    q[0] >= Math.min(p[0], r[0]) - 1e-12 &&
    q[1] <= Math.max(p[1], r[1]) + 1e-12 &&
    q[1] >= Math.min(p[1], r[1]) - 1e-12;

  const o1 = orient(a, b, c);
  const o2 = orient(a, b, d);
  const o3 = orient(c, d, a);
  const o4 = orient(c, d, b);

  if (o1 !== o2 && o3 !== o4) return true;
  if (o1 === 0 && onSegment(a, c, b)) return true;
  if (o2 === 0 && onSegment(a, d, b)) return true;
  if (o3 === 0 && onSegment(c, a, d)) return true;
  if (o4 === 0 && onSegment(c, b, d)) return true;
  return false;
}

/**
 * Returns true if adding `next` to `points` would create a self-intersecting polygon edge.
 * Does not count sharing the previous vertex.
 */
export function wouldSelfIntersect(
  points: LatLng[],
  next: LatLng
): boolean {
  if (points.length < 2) return false;
  const a = points[points.length - 1];
  const b = next;
  // New edge must not cross any non-adjacent existing edge
  for (let i = 0; i < points.length - 2; i++) {
    const c = points[i];
    const d = points[i + 1];
    // Skip edge that shares vertex with a (the last existing edge's start when i = n-3 is ok to check)
    if (i === points.length - 2) continue;
    if (segmentsIntersect(a, b, c, d)) {
      // Allow touching at vertex a only if c or d is a — already skipped adjacent
      return true;
    }
  }
  return false;
}

/**
 * Closing edge from last → first must not cross non-adjacent edges.
 */
export function closingWouldSelfIntersect(points: LatLng[]): boolean {
  if (points.length < 3) return false;
  const a = points[points.length - 1];
  const b = points[0];
  for (let i = 1; i < points.length - 2; i++) {
    if (segmentsIntersect(a, b, points[i], points[i + 1])) return true;
  }
  return false;
}

/** Haversine distance in meters */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Approx map px distance given zoom (Web Mercator rough). */
export function approxPxDistance(
  a: LatLng,
  b: LatLng,
  zoom: number
): number {
  const meters = haversineMeters(a, b);
  const metersPerPx =
    (156543.03392 * Math.cos((a[0] * Math.PI) / 180)) / 2 ** zoom;
  return meters / metersPerPx;
}
