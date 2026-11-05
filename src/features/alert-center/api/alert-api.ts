import type { Vehicle } from '@/types';
import type { AlertCenterSummary, AlertFilters, AlertRule, AlertSeverity, AlertType, AlertCategory, FleetAlert, TimelineEvent, VehicleAlertItem } from '@/types/alerts';
import { CARD_DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { delay } from '@/lib/utils';
import { generateMockAlerts, generateGeolocationDemoAlerts, generateDrivingQualityDemoAlerts, generateFleetParcDemoAlerts, generateSecurityDemoAlerts } from '../mocks/mockAlerts';
import { computeKpisFromAlerts } from '../mocks/mockKpis';
import {
  buildVehicleSummaries,
  generateVehicleHealth,
  getAllVehicleAlertItemsByCategory,
} from '../mocks/mockVehicleHealth';
import { generateTimelineForVehicle, alertsToTimelineEvents } from '../mocks/mockTimeline';
import { generateFleetOverview } from '../mocks/mockFleetOverview';
import { computeAnalytics } from '../mocks/mockAnalytics';
import type { AlertScopeRef } from '@/types/alert-config';
import { getVehicleDepartmentId, MOCK_ORG_STRUCTURE } from '../mocks/mockOrgStructure';
import { isDocumentAlert } from '../constants/vehicle-inspector-sections';
import { resolveCategoriesFromSections, resolveCategoriesFromCenterSections, type AlertConfigSectionId, type AlertCenterSectionId } from '../constants/alert-config-sections';
import { getTaxonomyEntry } from '../constants/alert-taxonomy';
import { getFleetParcAlertLabel } from '../constants/fleet-parc-alert-modules';
import type { SectionAlertVehicleRow } from '../constants/alert-section-vehicle-rows';
import { MOCK_GEOFENCE_ZONES } from '../mocks/mockGeofenceRules';
import { fetchGeofenceRules } from './alert-config-api';
import type { GeofenceAlertRule } from '@/types/alert-config';

let alertStore: FleetAlert[] = [];
let vehiclesRef: Vehicle[] = [];
let alertRulesStore: AlertRule[] = [];

export function initAlertStore(vehicles: Vehicle[]) {
  vehiclesRef = vehicles;
  const base = generateMockAlerts(vehicles);
  const geoDemos = generateGeolocationDemoAlerts(vehicles);
  const dqDemos = generateDrivingQualityDemoAlerts(vehicles);
  const parcDemos = generateFleetParcDemoAlerts(vehicles);
  const secDemos = generateSecurityDemoAlerts(vehicles);
  const existingKeys = new Set(base.map((a) => `${a.vehicleId}:${a.type}`));
  const merged = [...base];
  for (const alert of [...geoDemos, ...dqDemos, ...parcDemos, ...secDemos]) {
    const key = `${alert.vehicleId}:${alert.type}`;
    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      merged.push(alert);
    }
  }
  alertStore = merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function resolveVehicleIdsFromScopes(scopes: AlertScopeRef[]): string[] {
  const ids = new Set<string>();
  for (const scope of scopes) {
    if (scope.scopeType === 'vehicle') {
      ids.add(scope.scopeId);
      continue;
    }
    if (scope.scopeType === 'department') {
      const dept = MOCK_ORG_STRUCTURE.departments.find((d) => d.id === scope.scopeId);
      dept?.vehicleIds.forEach((id) => ids.add(id));
    }
  }
  return [...ids];
}

function createActiveAlertForVehicle(vehicleId: string, alertType: AlertType): FleetAlert {
  const vehicle = vehiclesRef.find((v) => v.id === vehicleId);
  const entry = getTaxonomyEntry(alertType);
  const createdAt = new Date().toISOString();
  return {
    id: `sync-${alertType}-${vehicleId}-${Date.now()}`,
    type: alertType,
    vehicleId,
    vehicleName: vehicle?.name ?? vehicleId,
    severity: entry.defaultSeverity,
    message: `Alerte ${entry.label} activée`,
    timestamp: "À l'instant",
    createdAt,
    location: vehicle?.location ?? '—',
    isRead: false,
    category: entry.category,
    status: 'active',
    priority: entry.defaultPriority,
    driverName: vehicle?.driver,
    fleetName: 'Flotte',
    coordinates: vehicle?.coordinates,
    recommendedAction: entry.recommendedAction,
    autoResolvable: entry.autoResolvable,
    businessImpact: entry.businessImpact,
    isActive: true,
  };
}

export function syncActiveAlertsForScopes(
  scopes: AlertScopeRef[],
  updates: Array<{ alertType: AlertType; enabled?: boolean }>
) {
  const vehicleIds = resolveVehicleIdsFromScopes(scopes);
  if (!vehicleIds.length) return;

  for (const update of updates) {
    if (update.enabled === undefined) continue;

    if (update.enabled) {
      for (const vehicleId of vehicleIds) {
        const hasActive = alertStore.some(
          (a) =>
            a.vehicleId === vehicleId &&
            a.type === update.alertType &&
            a.status !== 'resolved'
        );
        if (!hasActive) {
          alertStore = [createActiveAlertForVehicle(vehicleId, update.alertType), ...alertStore];
        }
      }
    } else {
      alertStore = alertStore.map((a) =>
        vehicleIds.includes(a.vehicleId) &&
        a.type === update.alertType &&
        a.status !== 'resolved'
          ? { ...a, status: 'resolved' as const, isActive: false }
          : a
      );
    }
  }
}

export function getAlertStore(): FleetAlert[] {
  return alertStore;
}

function getDayBounds(isoDate: string): { from: Date; to: Date } {
  const [year, month, day] = isoDate.split('-').map(Number);
  const from = new Date(year, month - 1, day, 0, 0, 0, 0);
  const to = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { from, to };
}

function getDateRangeFromFilters(filters: AlertFilters): { from?: Date; to?: Date } {
  if (filters.selectedDate) {
    return getDayBounds(filters.selectedDate);
  }
  return getDateRangeFromPreset(filters);
}

function getDateRangeFromPreset(filters: AlertFilters): { from?: Date; to?: Date } {
  const now = new Date();
  switch (filters.datePreset) {
    case 'today': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return { from: start, to: now };
    }
    case '24h':
      return { from: new Date(now.getTime() - 24 * 3600000), to: now };
    case '7d':
      return { from: new Date(now.getTime() - 7 * 24 * 3600000), to: now };
    default:
      return {};
  }
}

function getAlertTypesForIndicatorIds(indicatorIds: string[]): Set<string> {
  const types = new Set<string>();
  for (const id of indicatorIds) {
    const config = CARD_DASHBOARD_INDICATORS.find((i) => i.id === id);
    if (config) types.add(config.alertTypeId);
  }
  return types;
}

function applyFilters(alerts: FleetAlert[], filters?: AlertFilters): FleetAlert[] {
  if (!filters) return alerts;
  let result = [...alerts];

  if (filters.vehicleIds.length) {
    result = result.filter((a) => filters.vehicleIds.includes(a.vehicleId));
  }
  if (filters.categories.length) {
    result = result.filter((a) => filters.categories.includes(a.category));
  }
  if (filters.severities.length) {
    result = result.filter((a) => filters.severities.includes(a.severity));
  }
  if (filters.dashboardIndicatorIds.length) {
    const types = getAlertTypesForIndicatorIds(filters.dashboardIndicatorIds);
    result = result.filter((a) => types.has(a.type));
  }

  const { from, to } = getDateRangeFromFilters(filters);
  if (from) {
    result = result.filter((a) => new Date(a.createdAt) >= from);
  }
  if (to) {
    result = result.filter((a) => new Date(a.createdAt) <= to);
  }

  return result;
}

function applyVehicleStateFilters(
  summaries: ReturnType<typeof buildVehicleSummaries>,
  filters?: AlertFilters
) {
  if (!filters?.vehicleStates.length) return summaries;
  const states = filters.vehicleStates;

  return summaries.filter((s) => {
    const checks: boolean[] = [];
    if (states.includes('with_alerts')) checks.push(s.totalAlerts > 0);
    if (states.includes('without_alerts')) checks.push(s.totalAlerts === 0);
    return checks.some(Boolean);
  });
}

function applySummaryFilters(
  summaries: ReturnType<typeof buildVehicleSummaries>,
  filters?: AlertFilters
) {
  if (!filters) return summaries;
  let result = summaries;

  if (filters.departmentIds.length) {
    result = result.filter((s) => {
      const deptId = getVehicleDepartmentId(s.vehicleId);
      return deptId != null && filters.departmentIds.includes(deptId);
    });
  }
  if (filters.gpsStatuses.length) {
    result = result.filter((s) => filters.gpsStatuses.includes(s.gpsStatus));
  }
  if (filters.movementStates.length) {
    result = result.filter((s) => {
      if (filters.movementStates.includes('moving') && s.isMoving) return true;
      if (filters.movementStates.includes('stopped') && !s.isMoving) return true;
      return false;
    });
  }
  if (filters.dashboardIndicatorIds.length) {
    result = result.filter((s) =>
      filters.dashboardIndicatorIds.every(
        (id) => s.dashboardIndicators[id]?.status === 'active'
      )
    );
  }

  return result;
}

export async function fetchAlerts(filters?: AlertFilters) {
  await delay(400);
  return applyFilters(alertStore, filters);
}

export async function fetchVehicleSummaries(filters?: AlertFilters) {
  await delay(350);
  const filteredAlerts = applyFilters(alertStore, filters);
  const vehicleIdsWithAlerts = new Set(filteredAlerts.map((a) => a.vehicleId));

  let summaries = buildVehicleSummaries(vehiclesRef, alertStore);

  if (filters?.vehicleIds.length) {
    summaries = summaries.filter((s) => filters.vehicleIds.includes(s.vehicleId));
  }

  if (
    filters &&
    (filters.categories.length ||
      filters.severities.length ||
      filters.datePreset ||
      filters.selectedDate ||
      filters.dashboardIndicatorIds.length ||
      filters.vehicleIds.length)
  ) {
    summaries = summaries.filter((s) => vehicleIdsWithAlerts.has(s.vehicleId));
  }

  summaries = applyVehicleStateFilters(summaries, filters);
  summaries = applySummaryFilters(summaries, filters);

  if (filters?.severities.length) {
    summaries = summaries.filter((s) => {
      if (filters.severities!.includes('critical') && s.criticalCount > 0) return true;
      if (filters.severities!.includes('warning') && s.warningCount > 0) return true;
      if (filters.severities!.includes('info') && s.infoCount > 0) return true;
      return false;
    });
  }

  return summaries.sort((a, b) => b.criticalCount - a.criticalCount || b.totalAlerts - a.totalAlerts);
}

export async function fetchVehicleAlerts(vehicleId: string) {
  await delay(300);
  const vehicle = vehiclesRef.find((v) => v.id === vehicleId);
  if (!vehicle) return {} as Record<string, VehicleAlertItem[]>;

  return getAllVehicleAlertItemsByCategory(vehicleId, alertStore, vehicle);
}

export async function fetchKpis() {
  await delay(300);
  return computeKpisFromAlerts(alertStore);
}

export async function fetchVehicleHealth() {
  await delay(350);
  return generateVehicleHealth(vehiclesRef, alertStore);
}

export async function fetchFleetOverview() {
  await delay(300);
  const health = generateVehicleHealth(vehiclesRef, alertStore);
  const sosCount = alertStore.filter((a) => a.type === 'sos' && a.status === 'active').length;
  return generateFleetOverview(vehiclesRef, health, alertStore, sosCount);
}

function getUniqueVehiclesWithActiveAlerts(): number {
  const ids = new Set<string>();
  for (const alert of alertStore) {
    if (alert.status !== 'resolved') {
      ids.add(alert.vehicleId);
    }
  }
  return ids.size;
}

function getActiveSosVehicleCount(): number {
  const ids = new Set<string>();
  for (const alert of alertStore) {
    if (alert.type === 'sos' && alert.status === 'active') {
      ids.add(alert.vehicleId);
    }
  }
  return ids.size;
}

export async function fetchAlertCenterSummary(): Promise<AlertCenterSummary> {
  await delay(300);
  return {
    vehiclesInAlert: getUniqueVehiclesWithActiveAlerts(),
    activeSosVehicles: getActiveSosVehicleCount(),
    vehiclesOffline: vehiclesRef.filter((v) => v.status === 'offline').length,
  };
}

export interface RecentAlertsFilters {
  severities?: AlertSeverity[];
  alertTypes?: AlertType[];
  configSectionIds?: AlertConfigSectionId[];
  centerSectionIds?: AlertCenterSectionId[];
  vehicleIds?: string[];
  selectedDate?: string;
  limit?: number;
}

export async function fetchRecentAlerts(filters?: RecentAlertsFilters): Promise<TimelineEvent[]> {
  await delay(300);
  let result = [...alertStore];

  if (filters?.severities?.length) {
    result = result.filter((a) => filters.severities!.includes(a.severity));
  }
  if (filters?.alertTypes?.length) {
    result = result.filter((a) => filters.alertTypes!.includes(a.type));
  }
  if (filters?.configSectionIds) {
    if (filters.configSectionIds.length === 0) return [];
    const allowedCategories = resolveCategoriesFromSections(filters.configSectionIds);
    result = result.filter((a) => allowedCategories.includes(a.category));
  }
  if (filters?.centerSectionIds) {
    if (filters.centerSectionIds.length === 0) return [];
    const allowedCategories = resolveCategoriesFromCenterSections(filters.centerSectionIds);
    result = result.filter((a) => allowedCategories.includes(a.category));
  }
  if (filters?.vehicleIds?.length) {
    result = result.filter((a) => filters.vehicleIds!.includes(a.vehicleId));
  }
  if (filters?.selectedDate) {
    const { from, to } = getDayBounds(filters.selectedDate);
    result = result.filter((a) => {
      const created = new Date(a.createdAt);
      return created >= from && created <= to;
    });
  }

  const limit = filters?.limit ?? 15;
  result = result
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);

  return alertsToTimelineEvents(result);
}

export async function fetchVehicleTimeline(vehicleId: string) {
  await delay(250);
  return generateTimelineForVehicle(vehicleId, alertStore);
}

export async function fetchVehicleDocumentAlerts(vehicleId: string): Promise<FleetAlert[]> {
  await delay(200);
  return alertStore.filter(
    (a) =>
      a.vehicleId === vehicleId &&
      isDocumentAlert(a.type) &&
      a.status !== 'resolved'
  );
}

export async function fetchGeofenceRulesForVehicle(vehicleId: string): Promise<GeofenceAlertRule[]> {
  await delay(200);
  const rules = await fetchGeofenceRules();
  const deptId = getVehicleDepartmentId(vehicleId);
  return rules.filter(
    (r) =>
      r.enabled &&
      ((r.scopeType === 'vehicle' && r.scopeIds.includes(vehicleId)) ||
        (r.scopeType === 'department' && deptId != null && r.scopeIds.includes(deptId)))
  );
}

export async function fetchAnalytics() {
  await delay(400);
  return computeAnalytics(alertStore);
}

export async function resolveAlert(id: string) {
  await delay(200);
  alertStore = alertStore.map((a) =>
    a.id === id ? { ...a, status: 'resolved' as const, isRead: true } : a
  );
}

export async function markAllAlertsRead() {
  await delay(200);
  alertStore = alertStore.map((a) => ({ ...a, isRead: true }));
}

export function getUnreadCount(): number {
  return alertStore.filter((a) => !a.isRead && a.status !== 'resolved').length;
}

export async function fetchAlertRules() {
  await delay(200);
  return alertRulesStore;
}

export async function saveAlertRule(rule: Omit<AlertRule, 'id' | 'createdAt'>) {
  await delay(300);
  const newRule: AlertRule = {
    ...rule,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
  };
  alertRulesStore = [...alertRulesStore, newRule];
  return newRule;
}

export async function updateAlertRule(id: string, updates: Partial<AlertRule>) {
  await delay(200);
  alertRulesStore = alertRulesStore.map((r) => (r.id === id ? { ...r, ...updates } : r));
}

export function exportVehicleTimelineCsv(vehicleId: string): string {
  const events = generateTimelineForVehicle(vehicleId, alertStore);
  const header = 'Date,Heure,Alerte,Gravité,Description,Notifié';
  const rows = events.map(
    (e) =>
      `"${e.date}","${e.time}","${e.label}","${e.severity}","${e.description}","${e.notifiedUser ?? ''}"`
  );
  return [header, ...rows].join('\n');
}

export function getVehicleById(vehicleId: string): Vehicle | undefined {
  return vehiclesRef.find((v) => v.id === vehicleId);
}

export type { SectionAlertVehicleRow } from '../constants/alert-section-vehicle-rows';

export interface AlertHistoryFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  categories?: AlertCategory[];
  alertTypes?: AlertType[];
  vehicleIds?: string[];
}

export interface AlertHistoryRow {
  id: string;
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  locationOrZone: string;
  alertType: AlertType;
  alertTypeLabel: string;
  createdAt: string;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHistoryDateBounds(dateFrom?: string, dateTo?: string): { from: Date; to: Date } {
  const now = new Date();
  const defaultFrom = new Date(now);
  defaultFrom.setDate(defaultFrom.getDate() - 7);

  const fromIso = dateFrom ?? toIsoDate(defaultFrom);
  const toIso = dateTo ?? toIsoDate(now);

  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  return {
    from: new Date(fy, fm - 1, fd, 0, 0, 0, 0),
    to: new Date(ty, tm - 1, td, 23, 59, 59, 999),
  };
}

function getLocationOrZone(alert: FleetAlert): string {
  if (alert.category === 'geolocation') {
    const zone = parseZoneFromMessage(alert.message ?? '');
    return zone !== '—' ? zone : alert.location ?? '—';
  }
  return alert.location ?? '—';
}

export async function fetchAlertHistory(
  filters?: AlertHistoryFilters
): Promise<AlertHistoryRow[]> {
  await delay(300);
  let result = [...alertStore];

  const { from, to } = getHistoryDateBounds(filters?.dateFrom, filters?.dateTo);
  result = result.filter((a) => {
    const created = new Date(a.createdAt);
    return created >= from && created <= to;
  });

  if (filters?.vehicleIds?.length) {
    result = result.filter((a) => filters.vehicleIds!.includes(a.vehicleId));
  }

  if (filters?.categories?.length) {
    result = result.filter((a) => filters.categories!.includes(a.category));
  }

  if (filters?.alertTypes?.length) {
    result = result.filter((a) => filters.alertTypes!.includes(a.type));
  }

  const search = filters?.search?.trim().toLowerCase();
  if (search) {
    result = result.filter((a) => {
      const label = getTaxonomyEntry(a.type).label.toLowerCase();
      const vehicle = vehiclesRef.find((v) => v.id === a.vehicleId);
      const haystack = [
        a.vehicleName,
        a.driverName,
        vehicle?.name,
        vehicle?.driver,
        a.location,
        a.message,
        label,
        getLocationOrZone(a),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  return result
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((alert) => ({
      id: alert.id,
      vehicleId: alert.vehicleId,
      vehicleName: alert.vehicleName,
      driverName: alert.driverName ?? '—',
      locationOrZone: getLocationOrZone(alert),
      alertType: alert.type,
      alertTypeLabel: getTaxonomyEntry(alert.type).label,
      createdAt: alert.createdAt,
    }));
}

function getLatestActiveAlert(alertType: AlertType, vehicleId: string): FleetAlert | undefined {
  return alertStore
    .filter((a) => a.type === alertType && a.vehicleId === vehicleId && a.status !== 'resolved')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
}

function parseZoneFromMessage(message: string): string {
  const quoted = message.match(/"([^"]+)"/);
  if (quoted?.[1]) return quoted[1];
  const zoneMatch = message.match(/zone\s+(.+)/i);
  if (zoneMatch?.[1]) return zoneMatch[1].replace(/["']/g, '').trim();
  return MOCK_GEOFENCE_ZONES[0] ?? '—';
}

function getGeolocationEventLabel(alertType: AlertType): string {
  const entry = getTaxonomyEntry(alertType);
  if (alertType === 'geofence' || alertType === 'departure_point' || alertType === 'arrival_point') {
    return 'Entrée';
  }
  if (
    alertType === 'geofence_exit' ||
    alertType === 'polygon_exit' ||
    alertType === 'city_exit'
  ) {
    return 'Sortie';
  }
  if (alertType === 'route') return 'Déviation';
  return entry.label;
}

function truncateDetail(message: string, max = 80): string {
  if (message.length <= max) return message;
  return `${message.slice(0, max - 1)}…`;
}

function buildBaseRow(
  vehicleId: string,
  summaries: ReturnType<typeof buildVehicleSummaries>
): Pick<
  SectionAlertVehicleRow,
  'vehicleId' | 'licensePlate' | 'driverName' | 'location' | 'coordinates'
> {
  const summaryById = new Map(summaries.map((s) => [s.vehicleId, s]));
  const summary = summaryById.get(vehicleId);
  const vehicle = vehiclesRef.find((v) => v.id === vehicleId);
  return {
    vehicleId,
    licensePlate: summary?.licensePlate ?? vehicle?.name ?? vehicleId,
    driverName: summary?.driverName ?? vehicle?.driver ?? '—',
    location: summary?.location ?? vehicle?.location ?? '—',
    coordinates: summary?.coordinates ?? vehicle?.coordinates ?? [0, 0],
  };
}

function getActiveVehicleIdsForAlertType(alertType: AlertType): string[] {
  const ids = new Set<string>();
  for (const alert of alertStore) {
    if (alert.type === alertType && alert.status !== 'resolved') {
      ids.add(alert.vehicleId);
    }
  }
  return [...ids];
}

export async function fetchAlertTypeVehicleCounts(
  alertTypes: AlertType[]
): Promise<Partial<Record<AlertType, number>>> {
  await delay(200);
  const counts: Partial<Record<AlertType, number>> = {};
  for (const alertType of alertTypes) {
    counts[alertType] = getActiveVehicleIdsForAlertType(alertType).length;
  }
  return counts;
}

export async function fetchVehiclesForAlertType(
  alertType: AlertType,
  sectionId: AlertCenterSectionId
): Promise<SectionAlertVehicleRow[]> {
  await delay(250);
  const vehicleIds = getActiveVehicleIdsForAlertType(alertType);
  const summaries = buildVehicleSummaries(vehiclesRef, alertStore);

  return vehicleIds.map((vehicleId) => {
    const base = buildBaseRow(vehicleId, summaries);
    const alert = getLatestActiveAlert(alertType, vehicleId);
    const message = alert?.message ?? '';
    const withDate = { ...base, alertAt: alert?.createdAt ?? '' };

    switch (sectionId) {
      case 'vehicle_management': {
        const defaultLabel = getTaxonomyEntry(alertType).label;
        return {
          ...withDate,
          alertLabel: getFleetParcAlertLabel(alertType, defaultLabel),
        };
      }
      case 'geolocation':
        return {
          ...withDate,
          zone: parseZoneFromMessage(message),
          eventLabel: getGeolocationEventLabel(alertType),
        };
      case 'security':
      case 'driving_quality':
        return {
          ...withDate,
          detail: message ? truncateDetail(message) : '—',
        };
      case 'dashboard':
      default:
        return withDate;
    }
  });
}
