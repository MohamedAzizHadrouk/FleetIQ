import type {
  AlertScopeConfig,
  AlertScopeRef,
  ResolvedAlertConfig,
  ResolvedAlertState,
} from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import { getTaxonomyEntry } from '../constants/alert-taxonomy';

export function resolveAlertState(
  selectedScopes: AlertScopeRef[],
  configs: AlertScopeConfig[],
  alertType: AlertType
): ResolvedAlertState {
  if (selectedScopes.length === 0) return 'inactive';

  const matching = selectedScopes.map((scope) =>
    configs.find(
      (c) =>
        c.scopeType === scope.scopeType &&
        c.scopeId === scope.scopeId &&
        c.alertType === alertType
    )
  );

  const enabledCount = matching.filter((c) => c?.enabled).length;
  if (enabledCount === selectedScopes.length) return 'active';
  if (enabledCount === 0) return 'inactive';
  return 'partial';
}

export function resolveAlertConfig(
  selectedScopes: AlertScopeRef[],
  configs: AlertScopeConfig[],
  alertType: AlertType
): ResolvedAlertConfig {
  const state = resolveAlertState(selectedScopes, configs, alertType);
  const entry = getTaxonomyEntry(alertType);

  const matching = selectedScopes
    .map((scope) =>
      configs.find(
        (c) =>
          c.scopeType === scope.scopeType &&
          c.scopeId === scope.scopeId &&
          c.alertType === alertType
      )
    )
    .filter(Boolean) as AlertScopeConfig[];

  const first = matching[0];

  return {
    alertType,
    state,
    enabled: state === 'active',
    severity: matching.length && matching.every((c) => c.severity === first?.severity) && first
      ? first.severity
      : entry.defaultSeverity,
    displayOrder: first?.displayOrder,
    alertWhenContactOn: matching.every((c) => c.alertWhenContactOn === first?.alertWhenContactOn)
      ? first?.alertWhenContactOn
      : undefined,
    activationType: first?.activationType ?? 'permanent',
    activationStart: first?.activationStart,
    activationEnd: first?.activationEnd,
    thresholdConfig: first?.thresholdConfig,
  };
}

export function buildBatchUpdate(
  alertType: AlertType,
  patch: Partial<Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId' | 'alertType'>>
): Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId'> {
  const entry = getTaxonomyEntry(alertType);
  return {
    alertType,
    enabled: patch.enabled ?? true,
    severity: patch.severity ?? entry.defaultSeverity,
    displayOrder: patch.displayOrder,
    alertWhenContactOn: patch.alertWhenContactOn,
    activationType: patch.activationType ?? 'permanent',
    activationStart: patch.activationStart,
    activationEnd: patch.activationEnd,
    thresholdConfig: patch.thresholdConfig,
  };
}

export function resolveConfigsForSection(
  selectedScopes: AlertScopeRef[],
  configs: AlertScopeConfig[],
  alertTypes: AlertType[]
): ResolvedAlertConfig[] {
  return alertTypes.map((alertType) => resolveAlertConfig(selectedScopes, configs, alertType));
}

export function reorderDisplayOrders(
  items: ResolvedAlertConfig[],
  alertType: AlertType,
  direction: 'up' | 'down'
): Partial<Record<AlertType, number>> {
  const sorted = [...items]
    .filter((i) => i.displayOrder != null)
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  const idx = sorted.findIndex((i) => i.alertType === alertType);
  if (idx < 0) return {};

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return {};

  const orders: Partial<Record<AlertType, number>> = {};
  sorted.forEach((item, i) => {
    orders[item.alertType] = i + 1;
  });
  orders[sorted[idx].alertType] = swapIdx + 1;
  orders[sorted[swapIdx].alertType] = idx + 1;
  return orders;
}
