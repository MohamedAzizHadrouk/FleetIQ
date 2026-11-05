import type { TimelineEvent, FleetAlert, AlertType } from '@/types/alerts';
import { getTaxonomyEntry } from '../constants/alert-taxonomy';
import {
  isDocumentAlert,
  isGeofenceAlert,
  isGeneralAlert,
} from '../constants/vehicle-inspector-sections';

function formatDayLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return "Aujourd'hui";
  if (d.getTime() === yesterday.getTime()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function alertsToTimelineEvents(alerts: FleetAlert[]): TimelineEvent[] {
  return alerts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((alert) => {
      const created = new Date(alert.createdAt);
      const taxonomy = getTaxonomyEntry(alert.type);
      return {
        id: alert.id,
        time: created.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        date: formatDayLabel(created),
        type: alert.type,
        label: taxonomy.label,
        description: alert.message,
        severity: alert.severity,
        category: alert.category,
        notifiedUser: alert.notifiedUser,
        coordinates: alert.coordinates,
        vehicleId: alert.vehicleId,
        vehicleName: alert.vehicleName,
      };
    });
}

export function generateTimelineForVehicle(vehicleId: string, alertStore: FleetAlert[]): TimelineEvent[] {
  const vehicleAlerts = alertStore.filter((a) => a.vehicleId === vehicleId);
  if (vehicleAlerts.length) return alertsToTimelineEvents(vehicleAlerts);

  const fallbackTypes: { type: AlertType; label: string; severity: 'critical' | 'warning' | 'info' }[] = [
    { type: 'speeding', label: 'Dépassement vitesse', severity: 'critical' },
    { type: 'driver_door', label: 'Porte conducteur ouverte', severity: 'warning' },
    { type: 'fuel', label: 'Carburant faible', severity: 'warning' },
    { type: 'check_engine', label: 'Check Engine', severity: 'critical' },
    { type: 'battery', label: 'Batterie faible', severity: 'warning' },
  ];

  const now = Date.now();
  return fallbackTypes.map((e, i) => {
    const created = new Date(now - (fallbackTypes.length - i) * 45 * 60000 - (i > 2 ? 86400000 : 0));
    const taxonomy = getTaxonomyEntry(e.type);
    return {
      id: `${vehicleId}-tl-${i}`,
      time: created.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      date: formatDayLabel(created),
      type: e.type,
      label: e.label,
      description: `Événement ${e.label.toLowerCase()} détecté`,
      severity: e.severity,
      category: taxonomy.category,
      notifiedUser: 'Gestionnaire Flotte',
      coordinates: [48.8566 + i * 0.01, 2.3522 + i * 0.01] as [number, number],
    };
  });
}

export function filterTimelineEvents(
  events: TimelineEvent[],
  section: 'general' | 'geofence'
): TimelineEvent[] {
  return events.filter((e) =>
    section === 'geofence' ? isGeofenceAlert(e.type) : isGeneralAlert(e.type)
  );
}

export function groupTimelineByDay(events: TimelineEvent[]): { day: string; events: TimelineEvent[] }[] {
  const groups = new Map<string, TimelineEvent[]>();
  events.forEach((e) => {
    const list = groups.get(e.date) ?? [];
    list.push(e);
    groups.set(e.date, list);
  });
  return Array.from(groups.entries()).map(([day, evts]) => ({ day, events: evts }));
}

export { isDocumentAlert };
