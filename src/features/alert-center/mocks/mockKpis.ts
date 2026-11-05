import type { AlertKpiData } from '@/types/alerts';
import type { FleetAlert } from '@/types/alerts';

export function computeKpisFromAlerts(alerts: FleetAlert[]): AlertKpiData {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const active = alerts.filter((a) => a.status !== 'resolved');
  const critical = active.filter((a) => a.priority === 'critical').length;
  const high = active.filter((a) => a.priority === 'high').length;
  const medium = active.filter((a) => a.priority === 'medium' || a.priority === 'low').length;
  const resolvedToday = alerts.filter(
    (a) => a.status === 'resolved' && new Date(a.createdAt) >= today
  ).length;
  const vehicleIds = new Set(active.map((a) => a.vehicleId));

  return {
    critical,
    high,
    medium,
    resolvedToday,
    vehiclesInAlert: vehicleIds.size,
    total: active.length,
    trends: {
      critical: 12,
      high: -5,
      medium: 3,
      resolvedToday: 18,
      vehiclesInAlert: -2,
      total: 5,
    },
  };
}
