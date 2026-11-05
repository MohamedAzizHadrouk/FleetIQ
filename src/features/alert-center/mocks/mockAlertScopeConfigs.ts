import type { AlertScopeConfig } from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import { getTaxonomyEntry } from '../constants/alert-taxonomy';
import { getAlertTypesForSection } from '../constants/alert-config-sections';
import { getGeolocationAlertTypes } from '../constants/geolocation-alert-groups';
import { MOCK_ORG_STRUCTURE } from './mockOrgStructure';
import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';

let configIdCounter = 1;

function nextId() {
  return `cfg-${configIdCounter++}`;
}

function createConfig(
  scopeType: AlertScopeConfig['scopeType'],
  scopeId: string,
  alertType: AlertType,
  overrides?: Partial<AlertScopeConfig>
): AlertScopeConfig {
  const entry = getTaxonomyEntry(alertType);
  return {
    id: nextId(),
    scopeType,
    scopeId,
    alertType,
    enabled: overrides?.enabled ?? alertType !== 'unknown',
    severity: overrides?.severity ?? entry.defaultSeverity,
    displayOrder: overrides?.displayOrder,
    alertWhenContactOn: overrides?.alertWhenContactOn ?? false,
    activationType: overrides?.activationType ?? 'permanent',
    activationStart: overrides?.activationStart,
    activationEnd: overrides?.activationEnd,
    thresholdConfig: overrides?.thresholdConfig,
  };
}

function seedScopeConfigs(
  scopeType: AlertScopeConfig['scopeType'],
  scopeId: string,
  vehicleIds: string[]
): AlertScopeConfig[] {
  const configs: AlertScopeConfig[] = [];

  DASHBOARD_INDICATORS.forEach((ind, index) => {
    const alertType = ind.alertTypeId as AlertType;
    configs.push(
      createConfig(scopeType, scopeId, alertType, {
        displayOrder: index + 1,
        enabled: vehicleIds.length > 0,
        alertWhenContactOn: getTaxonomyEntry(alertType).contactOffOnly ? false : undefined,
      })
    );
  });

  getAlertTypesForSection('vehicle_management').forEach((alertType) => {
    configs.push(createConfig(scopeType, scopeId, alertType));
  });

  getGeolocationAlertTypes().forEach((alertType) => {
    configs.push(
      createConfig(scopeType, scopeId, alertType, {
        enabled: alertType === 'geofence' || alertType === 'geofence_exit' || alertType === 'route',
      })
    );
  });

  getAlertTypesForSection('security').forEach((alertType) => {
    const entry = getTaxonomyEntry(alertType);
    configs.push(
      createConfig(scopeType, scopeId, alertType, {
        thresholdConfig: entry.requiresConfiguration
          ? {
              value: alertType === 'speeding' ? 120 : alertType === 'excessive_idle' ? 15 : undefined,
              unit: alertType === 'speeding' ? 'km/h' : alertType === 'excessive_idle' ? 'min' : undefined,
            }
          : undefined,
      })
    );
  });

  return configs;
}

export function generateInitialScopeConfigs(): AlertScopeConfig[] {
  const all: AlertScopeConfig[] = [];

  for (let v = 1; v <= 10; v++) {
    const id = String(v);
    all.push(...seedScopeConfigs('vehicle', id, [id]));
    if (v === 1 || v === 7) {
      const fuel = all.find((c) => c.scopeId === id && c.alertType === 'fuel');
      if (fuel) fuel.enabled = false;
    }
  }

  for (const dept of MOCK_ORG_STRUCTURE.departments) {
    all.push(...seedScopeConfigs('department', dept.id, dept.vehicleIds));
  }

  for (const group of MOCK_ORG_STRUCTURE.groups) {
    all.push(...seedScopeConfigs('group', group.id, group.vehicleIds));
  }

  return all;
}

export const INITIAL_SCOPE_CONFIGS = generateInitialScopeConfigs();
