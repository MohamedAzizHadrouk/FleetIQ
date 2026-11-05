import { useEffect, useState } from 'react';
import type { LatLng } from '@/types/map-overlays';
import { fetchDrivingRoute } from '@/lib/osrm-routing';

export function useRouteMetrics(waypoints: LatLng[], active = true) {
  const [routing, setRouting] = useState(false);
  const [metrics, setMetrics] = useState<{
    distanceMeters: number;
    durationSeconds: number;
  } | null>(null);

  useEffect(() => {
    if (!active || waypoints.length < 2) {
      setMetrics(null);
      setRouting(false);
      return;
    }

    let cancelled = false;
    setRouting(true);
    const timer = window.setTimeout(() => {
      void fetchDrivingRoute(waypoints).then((result) => {
        if (cancelled) return;
        setMetrics({
          distanceMeters: result.distanceMeters,
          durationSeconds: result.durationSeconds,
        });
        setRouting(false);
      });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [waypoints, active]);

  return { metrics, routing };
}
