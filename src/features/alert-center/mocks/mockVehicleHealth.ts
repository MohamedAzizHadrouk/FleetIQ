import type { Vehicle } from '@/types';
import type {
  DashboardIndicatorState,
  FleetAlert,
  HealthIndicatorStatus,
  IndicatorType,
  VehicleAlertItem,
  VehicleAlertSummary,
  VehicleHealthSnapshot,
} from '@/types/alerts';
import { CARD_DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { VEHICLE_INDICATORS } from '@/design-system/vehicle-indicators';
import { getTaxonomyEntry, getAlertsByCategory } from '../constants/alert-taxonomy';
import {
  deriveIgnitionFromVehicle,
  deriveIsMoving,
  filterAlertsByBusinessRules,
} from '../lib/alert-business-rules';

const FLEETS = ['Flotte Nord', 'Flotte Sud', 'Flotte Express', 'Flotte Urbaine'];

function randomStatus(seed: number, vehicleOffline: boolean): HealthIndicatorStatus {
  if (vehicleOffline) return seed % 3 === 0 ? 'offline' : 'unknown';
  const r = seed % 10;
  if (r === 0) return 'critical';
  if (r <= 2) return 'warning';
  if (r <= 8) return 'ok';
  return 'unknown';
}

function deriveLicensePlate(name: string, idx: number): string {
  const parts = name.split(' ');
  if (parts.length >= 3) return name;
  return `${1000 + idx} TU ${200 + idx}`;
}

export function buildDashboardIndicators(
  vehicleAlerts: FleetAlert[],
  vehicle: Vehicle
): Record<string, DashboardIndicatorState> {
  const runtime = {
    ignitionOn: deriveIgnitionFromVehicle(vehicle.status, vehicle.speed),
    isMoving: deriveIsMoving(vehicle.speed, vehicle.status),
  };
  const visible = filterAlertsByBusinessRules(vehicleAlerts.filter((a) => a.status !== 'resolved'), runtime);
  const activeTypes = new Set(visible.map((a) => a.type));

  const result: Record<string, DashboardIndicatorState> = {};
  CARD_DASHBOARD_INDICATORS.forEach((ind) => {
    const matching = visible.find((a) => a.type === ind.alertTypeId);
    const isActive = activeTypes.has(ind.alertTypeId);
    result[ind.id] = {
      id: ind.id,
      label: ind.label,
      status: isActive ? 'active' : 'inactive',
      severity: matching?.severity,
    };
  });
  return result;
}

export function generateVehicleHealth(vehicles: Vehicle[], alertStore?: FleetAlert[]): VehicleHealthSnapshot[] {
  return vehicles.map((v, idx) => {
    const offline = v.status === 'offline';
    const indicators = {} as Record<IndicatorType, HealthIndicatorStatus>;
    VEHICLE_INDICATORS.forEach((ind, i) => {
      indicators[ind.type] = randomStatus(idx + i, offline);
    });
    if (v.batteryLevel < 20) indicators.battery = 'critical';
    else if (v.batteryLevel < 40) indicators.battery = 'warning';
    if (v.status === 'active' && v.speed > 100) indicators.sos = 'warning';

    const vehicleAlerts = alertStore?.filter((a) => a.vehicleId === v.id && a.status !== 'resolved') ?? [];
    const dashboardIndicators = buildDashboardIndicators(vehicleAlerts, v);

    const scores = Object.values(indicators).map((s) => {
      if (s === 'ok') return 100;
      if (s === 'warning') return 70;
      if (s === 'critical') return 30;
      if (s === 'offline') return 10;
      return 50;
    });
    const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const criticalCount = vehicleAlerts.filter((a) => a.severity === 'critical').length;
    const warningCount = vehicleAlerts.filter((a) => a.severity === 'warning').length;
    const infoCount = vehicleAlerts.filter((a) => a.severity === 'info').length;

    return {
      vehicleId: v.id,
      vehicleName: v.name,
      driverName: v.driver,
      fleetName: FLEETS[idx % FLEETS.length],
      licensePlate: deriveLicensePlate(v.name, idx),
      indicators,
      dashboardIndicators,
      overallScore,
      alertCount: vehicleAlerts.length,
      criticalCount,
      warningCount,
      infoCount,
      status: v.status,
      ignitionOn: deriveIgnitionFromVehicle(v.status, v.speed),
      isMoving: deriveIsMoving(v.speed, v.status),
      lastCommunication: v.lastUpdate,
      location: v.location,
      coordinates: v.coordinates,
      gpsStatus: offline ? 'offline' : 'online',
    };
  });
}

export function buildVehicleSummaries(
  vehicles: Vehicle[],
  alertStore: FleetAlert[]
): VehicleAlertSummary[] {
  const health = generateVehicleHealth(vehicles, alertStore);
  return health.map((h) => ({
    vehicleId: h.vehicleId,
    vehicleName: h.vehicleName,
    licensePlate: h.licensePlate ?? h.vehicleName,
    driverName: h.driverName,
    fleetName: h.fleetName,
    status: h.status,
    gpsStatus: h.gpsStatus,
    lastCommunication: h.lastCommunication,
    location: h.location,
    coordinates: h.coordinates,
    ignitionOn: h.ignitionOn,
    isMoving: h.isMoving,
    criticalCount: h.criticalCount,
    warningCount: h.warningCount,
    infoCount: h.infoCount,
    totalAlerts: h.alertCount,
    dashboardIndicators: h.dashboardIndicators,
    overallScore: h.overallScore,
  }));
}

export function buildVehicleAlertItems(
  vehicleId: string,
  alertStore: FleetAlert[],
  vehicle: Vehicle
): VehicleAlertItem[] {
  const runtime = {
    ignitionOn: deriveIgnitionFromVehicle(vehicle.status, vehicle.speed),
    isMoving: deriveIsMoving(vehicle.speed, vehicle.status),
  };

  const allTypes = Object.values(
    alertStore
      .filter((a) => a.vehicleId === vehicleId)
      .reduce<Record<string, FleetAlert>>((acc, a) => {
        if (!acc[a.type] || new Date(a.createdAt) > new Date(acc[a.type].createdAt)) {
          acc[a.type] = a;
        }
        return acc;
      }, {})
  );

  return Object.values(
    CARD_DASHBOARD_INDICATORS.reduce<Record<string, VehicleAlertItem>>((acc, ind) => {
      const alert = allTypes.find((a) => a.type === ind.alertTypeId);
      const taxonomy = getTaxonomyEntry(ind.alertTypeId);
      const isActive = alert ? filterAlertsByBusinessRules([alert], runtime).length > 0 : false;
      acc[ind.alertTypeId] = {
        type: ind.alertTypeId,
        label: taxonomy.label,
        category: taxonomy.category,
        severity: alert?.severity ?? taxonomy.defaultSeverity,
        isActive: Boolean(alert && isActive && alert.status !== 'resolved'),
        status: alert?.status ?? 'resolved',
        message: alert?.message,
        notifiedUser: alert?.notifiedUser,
        alertId: alert?.id,
      };
      return acc;
    }, {})
  ).concat(
    allTypes
      .filter((a) => !CARD_DASHBOARD_INDICATORS.some((d) => d.alertTypeId === a.type))
      .map((alert) => {
        const taxonomy = getTaxonomyEntry(alert.type);
        const visible = filterAlertsByBusinessRules([alert], runtime).length > 0;
        return {
          type: alert.type,
          label: taxonomy.label,
          category: taxonomy.category,
          severity: alert.severity,
          isActive: visible && alert.status !== 'resolved',
          status: alert.status,
          message: alert.message,
          notifiedUser: alert.notifiedUser,
          alertId: alert.id,
        };
      })
  );
}

export function getAllVehicleAlertItemsByCategory(
  vehicleId: string,
  alertStore: FleetAlert[],
  vehicle: Vehicle
): Record<string, VehicleAlertItem[]> {
  const runtime = {
    ignitionOn: deriveIgnitionFromVehicle(vehicle.status, vehicle.speed),
    isMoving: deriveIsMoving(vehicle.speed, vehicle.status),
  };

  const alertByType = alertStore
    .filter((a) => a.vehicleId === vehicleId)
    .reduce<Record<string, FleetAlert>>((acc, a) => {
      if (!acc[a.type] || new Date(a.createdAt) > new Date(acc[a.type].createdAt)) {
        acc[a.type] = a;
      }
      return acc;
    }, {});

  const grouped: Record<string, VehicleAlertItem[]> = {
    dashboard: [],
    vehicle_management: [],
    geolocation: [],
    driving_quality: [],
    security: [],
  };

  (['dashboard', 'vehicle_management', 'geolocation', 'driving_quality', 'security'] as const).forEach(
    (category) => {
      const taxonomyEntries = getAlertsByCategory(category);
      taxonomyEntries.forEach((entry) => {
        const alert = alertByType[entry.id];
        const visible = alert ? filterAlertsByBusinessRules([alert], runtime).length > 0 : false;
        grouped[category].push({
          type: entry.id,
          label: entry.label,
          category: entry.category,
          severity: alert?.severity ?? entry.defaultSeverity,
          isActive: Boolean(alert && visible && alert.status !== 'resolved'),
          status: alert?.status ?? 'resolved',
          message: alert?.message,
          notifiedUser: alert?.notifiedUser,
          alertId: alert?.id,
        });
      });
    }
  );

  return grouped;
}
