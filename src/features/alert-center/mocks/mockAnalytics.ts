import type { AlertAnalyticsData } from '@/types/alerts';
import type { FleetAlert } from '@/types/alerts';
import { CATEGORY_LABELS } from '@/design-system/alert-categories';

export function computeAnalytics(alerts: FleetAlert[]): AlertAnalyticsData {
  const categoryMap = new Map<string, number>();
  const vehicleMap = new Map<string, number>();
  const driverMap = new Map<string, number>();

  alerts.forEach((a) => {
    const cat = CATEGORY_LABELS[a.category];
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
    vehicleMap.set(a.vehicleName, (vehicleMap.get(a.vehicleName) ?? 0) + 1);
    if (a.driverName) driverMap.set(a.driverName, (driverMap.get(a.driverName) ?? 0) + 1);
  });

  const byHour = Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}h`,
    count: Math.floor(Math.random() * 12) + (h >= 8 && h <= 18 ? 8 : 2),
  }));

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const byDay = days.map((day) => ({ day, count: Math.floor(Math.random() * 30) + 10 }));

  return {
    byCategory: Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count })),
    byVehicle: Array.from(vehicleMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    byDriver: Array.from(driverMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    byHour,
    byDay,
    avgResolutionMinutes: 11.2,
  };
}
