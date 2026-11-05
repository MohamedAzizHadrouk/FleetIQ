import type { FleetOverviewData, FleetStatusVehicleItem } from '@/types/alerts';
import type { Vehicle } from '@/types';
import type { FleetAlert, VehicleHealthSnapshot } from '@/types/alerts';
import { buildVehicleSummaries } from './mockVehicleHealth';

function toStatusItem(
  vehicle: Vehicle,
  summary?: { licensePlate: string; driverName: string; lastCommunication: string }
): FleetStatusVehicleItem {
  return {
    vehicleId: vehicle.id,
    vehicleName: vehicle.name,
    licensePlate: summary?.licensePlate,
    driverName: summary?.driverName ?? vehicle.driver,
    detail: summary?.lastCommunication ?? vehicle.lastUpdate,
  };
}

export function generateFleetOverview(
  vehicles: Vehicle[],
  health: VehicleHealthSnapshot[],
  alertStore: FleetAlert[],
  sosCount: number
): FleetOverviewData {
  const summaries = buildVehicleSummaries(vehicles, alertStore);
  const summaryById = new Map(summaries.map((s) => [s.vehicleId, s]));

  const onlineVehicles = vehicles
    .filter((v) => v.status !== 'offline')
    .map((v) => toStatusItem(v, summaryById.get(v.id)));

  const offlineVehicles = vehicles
    .filter((v) => v.status === 'offline')
    .map((v) => toStatusItem(v, summaryById.get(v.id)));

  const sosAlerts = alertStore.filter((a) => a.type === 'sos' && a.status === 'active');
  const sosVehicleIds = [...new Set(sosAlerts.map((a) => a.vehicleId))];
  const sosVehicles: FleetStatusVehicleItem[] = sosVehicleIds.map((vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    const alert = sosAlerts.find((a) => a.vehicleId === vehicleId);
    const summary = summaryById.get(vehicleId);
    return {
      vehicleId,
      vehicleName: vehicle?.name ?? alert?.vehicleName ?? vehicleId,
      licensePlate: summary?.licensePlate,
      driverName: summary?.driverName ?? vehicle?.driver,
      detail: alert?.message ?? 'Signal SOS actif',
    };
  });

  const topRisk = [...health]
    .sort((a, b) => a.overallScore - b.overallScore || b.alertCount - a.alertCount)
    .slice(0, 5)
    .map((h) => ({
      vehicleId: h.vehicleId,
      vehicleName: h.vehicleName,
      criticalCount: h.criticalCount,
      warningCount: h.warningCount,
      infoCount: h.infoCount,
    }));

  return {
    vehiclesOnline: onlineVehicles.length,
    vehiclesOffline: offlineVehicles.length,
    activeSosCount: sosCount,
    onlineVehicles,
    offlineVehicles,
    sosVehicles,
    upcomingMaintenance: [
      { id: 'maint-1', vehicleName: vehicles[0]?.name ?? 'Fleet-001', dueIn: '3 jours', type: 'Révision' },
      { id: 'maint-2', vehicleName: vehicles[2]?.name ?? 'Fleet-003', dueIn: '1 semaine', type: 'Pneus' },
      { id: 'maint-3', vehicleName: vehicles[5]?.name ?? 'Fleet-006', dueIn: '12 jours', type: 'Vidange' },
      { id: 'maint-4', vehicleName: vehicles[1]?.name ?? 'Fleet-002', dueIn: '18 jours', type: 'Freins' },
      { id: 'maint-5', vehicleName: vehicles[3]?.name ?? 'Fleet-004', dueIn: '3 semaines', type: 'Contrôle technique' },
      { id: 'maint-6', vehicleName: vehicles[4]?.name ?? 'Fleet-005', dueIn: '1 mois', type: 'Courroie' },
      { id: 'maint-7', vehicleName: vehicles[7]?.name ?? 'Fleet-008', dueIn: '6 semaines', type: 'Filtres' },
    ],
    topRiskVehicles: topRisk,
  };
}
