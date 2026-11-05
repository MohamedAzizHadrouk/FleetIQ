import type {
  AlertNotificationContact,
  AlertScopeConfig,
  AlertScopeRef,
  BuiltinSeverityOverride,
  CustomSeverityLevel,
  DefaultAlertConfigTemplate,
  GeofenceAlertRule,
  OrgStructure,
  SeverityNotificationPolicy,
} from '@/types/alert-config';
import { INITIAL_ALERT_CONTACTS } from '../mocks/mockAlertContacts';
import { INITIAL_GEOFENCE_RULES } from '../mocks/mockGeofenceRules';
import { INITIAL_SCOPE_CONFIGS } from '../mocks/mockAlertScopeConfigs';
import { INITIAL_SEVERITY_POLICIES } from '../mocks/mockSeverityPolicies';
import { MOCK_ORG_STRUCTURE } from '../mocks/mockOrgStructure';
import { MOCK_NAMED_USERS } from '../mocks/mockNamedUsers';
import {
  INITIAL_BUILTIN_SEVERITY_OVERRIDES,
  INITIAL_CUSTOM_SEVERITIES,
} from '../mocks/mockCustomSeverities';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let scopeConfigsStore: AlertScopeConfig[] = [...INITIAL_SCOPE_CONFIGS];
let geofenceRulesStore: GeofenceAlertRule[] = [...INITIAL_GEOFENCE_RULES];
let severityPoliciesStore: SeverityNotificationPolicy[] = [...INITIAL_SEVERITY_POLICIES];
let contactsStore: AlertNotificationContact[] = [...INITIAL_ALERT_CONTACTS];
let customSeveritiesStore: CustomSeverityLevel[] = [...INITIAL_CUSTOM_SEVERITIES];
let builtinOverridesStore: BuiltinSeverityOverride[] = [...INITIAL_BUILTIN_SEVERITY_OVERRIDES];
let defaultTemplateStore: DefaultAlertConfigTemplate | null = null;
let fleetVehicleIdsStore: string[] = [];

function toTemplateScopeConfig(
  config: AlertScopeConfig
): Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId'> {
  const { id: _id, scopeType: _scopeType, scopeId: _scopeId, ...rest } = config;
  return rest;
}

function vehicleHasScopeConfigs(vehicleId: string): boolean {
  return scopeConfigsStore.some((c) => c.scopeType === 'vehicle' && c.scopeId === vehicleId);
}

function geofenceRuleMatchesScope(rule: GeofenceAlertRule, scope: AlertScopeRef): boolean {
  return rule.scopeType === scope.scopeType && rule.scopeIds.includes(scope.scopeId);
}

export function registerFleetVehiclesForConfigSync(vehicleIds: string[]): void {
  fleetVehicleIdsStore = vehicleIds;
}

function syncDefaultConfigsForVehiclesInternal(vehicleIds: string[]): void {
  if (!defaultTemplateStore) return;
  for (const vehicleId of vehicleIds) {
    if (!vehicleHasScopeConfigs(vehicleId)) {
      applyDefaultTemplateToVehicleInternal(vehicleId);
    }
  }
}

function applyDefaultTemplateToVehicleInternal(vehicleId: string): void {
  if (!defaultTemplateStore || vehicleHasScopeConfigs(vehicleId)) return;

  const newConfigs: AlertScopeConfig[] = defaultTemplateStore.scopeConfigs.map((template) => ({
    id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    scopeType: 'vehicle' as const,
    scopeId: vehicleId,
    ...template,
  }));
  scopeConfigsStore = [...scopeConfigsStore, ...newConfigs];

  const existingRuleNames = new Set(
    geofenceRulesStore
      .filter((r) => r.scopeType === 'vehicle' && r.scopeIds.includes(vehicleId))
      .map((r) => r.name)
  );

  const newRules: GeofenceAlertRule[] = defaultTemplateStore.geofenceRules
    .filter((rule) => !existingRuleNames.has(rule.name))
    .map((rule) => ({
      ...rule,
      id: `geo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      scopeType: 'vehicle' as const,
      scopeIds: [vehicleId],
    }));

  if (newRules.length > 0) {
    geofenceRulesStore = [...geofenceRulesStore, ...newRules];
  }
}

export async function fetchDefaultAlertTemplate(): Promise<DefaultAlertConfigTemplate | null> {
  await delay(200);
  return defaultTemplateStore;
}

export async function saveDefaultAlertTemplate(
  scope: AlertScopeRef
): Promise<DefaultAlertConfigTemplate> {
  await delay(350);

  const scopeConfigs = scopeConfigsStore
    .filter((c) => c.scopeType === scope.scopeType && c.scopeId === scope.scopeId)
    .map(toTemplateScopeConfig);

  const geofenceRules = geofenceRulesStore
    .filter((r) => geofenceRuleMatchesScope(r, scope))
    .map(({ id: _id, ...rest }) => rest);

  defaultTemplateStore = {
    updatedAt: new Date().toISOString(),
    sourceScope: scope,
    scopeConfigs,
    geofenceRules,
  };

  if (fleetVehicleIdsStore.length > 0) {
    syncDefaultConfigsForVehiclesInternal(fleetVehicleIdsStore);
  }

  return defaultTemplateStore;
}

export async function applyDefaultTemplateToVehicle(vehicleId: string): Promise<void> {
  await delay(200);
  applyDefaultTemplateToVehicleInternal(vehicleId);
}

export async function syncDefaultConfigsForVehicles(vehicleIds: string[]): Promise<void> {
  await delay(200);
  fleetVehicleIdsStore = vehicleIds;
  syncDefaultConfigsForVehiclesInternal(vehicleIds);
}

export async function fetchOrgStructure(): Promise<OrgStructure> {
  await delay(200);
  return MOCK_ORG_STRUCTURE;
}

export async function fetchNamedUsers() {
  await delay(150);
  return MOCK_NAMED_USERS;
}

export async function fetchScopeConfigs(): Promise<AlertScopeConfig[]> {
  await delay(300);
  if (defaultTemplateStore && fleetVehicleIdsStore.length > 0) {
    syncDefaultConfigsForVehiclesInternal(fleetVehicleIdsStore);
  }
  return scopeConfigsStore;
}

export async function fetchScopeConfigsForScopes(
  scopes: AlertScopeRef[]
): Promise<AlertScopeConfig[]> {
  await delay(250);
  return scopeConfigsStore.filter((c) =>
    scopes.some((s) => s.scopeType === c.scopeType && s.scopeId === c.scopeId)
  );
}

export async function batchUpsertScopeConfigs(
  scopes: AlertScopeRef[],
  updates: Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId'>[]
): Promise<AlertScopeConfig[]> {
  await delay(350);
  const results: AlertScopeConfig[] = [];

  for (const scope of scopes) {
    for (const update of updates) {
      const existing = scopeConfigsStore.find(
        (c) =>
          c.scopeType === scope.scopeType &&
          c.scopeId === scope.scopeId &&
          c.alertType === update.alertType
      );

      if (existing) {
        const merged = { ...existing, ...update };
        scopeConfigsStore = scopeConfigsStore.map((c) =>
          c.id === existing.id ? merged : c
        );
        results.push(merged);
      } else {
        const created: AlertScopeConfig = {
          id: `cfg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          scopeType: scope.scopeType,
          scopeId: scope.scopeId,
          ...update,
        };
        scopeConfigsStore = [...scopeConfigsStore, created];
        results.push(created);
      }
    }
  }

  return results;
}

export async function fetchGeofenceRules(): Promise<GeofenceAlertRule[]> {
  await delay(300);
  return geofenceRulesStore;
}

export async function saveGeofenceRule(
  rule: Omit<GeofenceAlertRule, 'id'> & { id?: string }
): Promise<GeofenceAlertRule> {
  await delay(300);
  if (rule.id) {
    const updated = { ...rule, id: rule.id } as GeofenceAlertRule;
    geofenceRulesStore = geofenceRulesStore.map((r) => (r.id === rule.id ? updated : r));
    return updated;
  }
  const created: GeofenceAlertRule = {
    ...rule,
    id: `geo-${Date.now()}`,
  };
  geofenceRulesStore = [...geofenceRulesStore, created];
  return created;
}

export async function deleteGeofenceRule(id: string): Promise<void> {
  await delay(200);
  geofenceRulesStore = geofenceRulesStore.filter((r) => r.id !== id);
}

export async function fetchSeverityPolicies(): Promise<SeverityNotificationPolicy[]> {
  await delay(250);
  return severityPoliciesStore;
}

export async function saveSeverityPolicies(
  policies: SeverityNotificationPolicy[]
): Promise<SeverityNotificationPolicy[]> {
  await delay(300);
  severityPoliciesStore = policies;
  return severityPoliciesStore;
}

export async function fetchAlertContacts(): Promise<AlertNotificationContact[]> {
  await delay(300);
  return contactsStore;
}

export async function saveAlertContact(
  contact: Omit<AlertNotificationContact, 'id'> & { id?: string }
): Promise<AlertNotificationContact> {
  await delay(300);
  if (contact.id) {
    const updated = contact as AlertNotificationContact;
    contactsStore = contactsStore.map((c) => (c.id === contact.id ? updated : c));
    return updated;
  }
  const created: AlertNotificationContact = {
    ...contact,
    id: `contact-${Date.now()}`,
  };
  contactsStore = [...contactsStore, created];
  return created;
}

export async function deleteAlertContact(id: string): Promise<void> {
  await delay(200);
  contactsStore = contactsStore.filter((c) => c.id !== id);
}

export async function fetchCustomSeverities(): Promise<CustomSeverityLevel[]> {
  await delay(200);
  return [...customSeveritiesStore].sort((a, b) => a.order - b.order);
}

export async function saveCustomSeverities(
  levels: CustomSeverityLevel[]
): Promise<CustomSeverityLevel[]> {
  await delay(300);
  customSeveritiesStore = levels;
  return customSeveritiesStore;
}

export async function fetchBuiltinSeverityOverrides(): Promise<BuiltinSeverityOverride[]> {
  await delay(200);
  return builtinOverridesStore;
}

export async function saveBuiltinSeverityOverrides(
  overrides: BuiltinSeverityOverride[]
): Promise<BuiltinSeverityOverride[]> {
  await delay(300);
  builtinOverridesStore = overrides;
  return builtinOverridesStore;
}

export function resetAlertConfigStores() {
  scopeConfigsStore = [...INITIAL_SCOPE_CONFIGS];
  geofenceRulesStore = [...INITIAL_GEOFENCE_RULES];
  severityPoliciesStore = [...INITIAL_SEVERITY_POLICIES];
  contactsStore = [...INITIAL_ALERT_CONTACTS];
  customSeveritiesStore = [...INITIAL_CUSTOM_SEVERITIES];
  builtinOverridesStore = [...INITIAL_BUILTIN_SEVERITY_OVERRIDES];
  defaultTemplateStore = null;
  fleetVehicleIdsStore = [];
}
