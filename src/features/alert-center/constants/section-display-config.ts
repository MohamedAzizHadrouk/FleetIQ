import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import type { AlertType } from '@/types/alerts';
import {
  getAlertTypesForCenterSection,
  type AlertCenterSectionId,
} from './alert-config-sections';

export interface SectionDisplayItem {
  alertType: AlertType;
  visible: boolean;
  displayOrder: number;
}

export interface SectionDisplayConfig {
  items: SectionDisplayItem[];
  updatedAt: string;
}

export type AllSectionsDisplayConfig = Record<AlertCenterSectionId, SectionDisplayConfig>;

export const STORAGE_KEY = 'fleetiq-alert-center-section-display';
export const LEGACY_DASHBOARD_STORAGE_KEY = 'fleetiq-dashboard-display-config';

export const DASHBOARD_CENTER_ALERT_TYPES: AlertType[] = DASHBOARD_INDICATORS.map(
  (indicator) => indicator.alertTypeId
);

export const DASHBOARD_CENTER_EXCLUDED_BY_DEFAULT: AlertType[] = [
  'trunk',
  'driver_door',
  'front_right_door',
  'rear_left_door',
  'rear_right_door',
  'ac',
  'central_lock',
];

export const ALL_CENTER_SECTION_IDS: AlertCenterSectionId[] = [
  'dashboard',
  'vehicle_management',
  'geolocation',
  'security',
  'driving_quality',
];

export function getPoolAlertTypesForSection(sectionId: AlertCenterSectionId): AlertType[] {
  return getAlertTypesForCenterSection(sectionId);
}

function isDefaultVisible(_sectionId: AlertCenterSectionId, _alertType: AlertType): boolean {
  // Match Webtrace alert center: all catalog cards visible by default
  return true;
}

export function buildDefaultSectionDisplayConfig(
  sectionId: AlertCenterSectionId
): SectionDisplayConfig {
  const pool = getPoolAlertTypesForSection(sectionId);
  const items: SectionDisplayItem[] = pool.map((alertType, index) => ({
    alertType,
    visible: isDefaultVisible(sectionId, alertType),
    displayOrder: index + 1,
  }));

  return {
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function buildAllDefaultSectionDisplayConfigs(): AllSectionsDisplayConfig {
  return ALL_CENTER_SECTION_IDS.reduce<AllSectionsDisplayConfig>((acc, sectionId) => {
    acc[sectionId] = buildDefaultSectionDisplayConfig(sectionId);
    return acc;
  }, {} as AllSectionsDisplayConfig);
}

export function mergeSectionDisplayConfig(
  sectionId: AlertCenterSectionId,
  stored: SectionDisplayConfig | null
): SectionDisplayConfig {
  const defaults = buildDefaultSectionDisplayConfig(sectionId);
  if (!stored?.items?.length) return defaults;

  const pool = getPoolAlertTypesForSection(sectionId);
  const storedByType = new Map(stored.items.map((item) => [item.alertType, item]));
  const mergedItems: SectionDisplayItem[] = [];
  let maxOrder = Math.max(...stored.items.map((i) => i.displayOrder), 0);

  for (const alertType of pool) {
    const existing = storedByType.get(alertType);
    if (existing) {
      mergedItems.push(existing);
    } else {
      maxOrder += 1;
      mergedItems.push({
        alertType,
        visible: isDefaultVisible(sectionId, alertType),
        displayOrder: maxOrder,
      });
    }
  }

  return {
    items: mergedItems.sort((a, b) => a.displayOrder - b.displayOrder),
    updatedAt: stored.updatedAt,
  };
}

export function mergeAllSectionDisplayConfigs(
  stored: Partial<AllSectionsDisplayConfig> | null
): AllSectionsDisplayConfig {
  const defaults = buildAllDefaultSectionDisplayConfigs();
  if (!stored) return defaults;

  return ALL_CENTER_SECTION_IDS.reduce<AllSectionsDisplayConfig>((acc, sectionId) => {
    acc[sectionId] = mergeSectionDisplayConfig(sectionId, stored[sectionId] ?? null);
    return acc;
  }, {} as AllSectionsDisplayConfig);
}

export function getVisibleAlertTypesForSection(config: SectionDisplayConfig): AlertType[] {
  return [...config.items]
    .filter((item) => item.visible)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((item) => item.alertType);
}

export function isDoorOrTrunkAlert(alertType: AlertType): boolean {
  return DASHBOARD_CENTER_EXCLUDED_BY_DEFAULT.includes(alertType);
}

export function reorderSectionItems(
  items: SectionDisplayItem[],
  alertType: AlertType,
  direction: 'up' | 'down'
): SectionDisplayItem[] {
  const sorted = [...items].sort((a, b) => a.displayOrder - b.displayOrder);
  const idx = sorted.findIndex((item) => item.alertType === alertType);
  if (idx < 0) return items;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sorted.length) return items;

  const next = sorted.map((item, i) => ({
    ...item,
    displayOrder: i + 1,
  }));

  const currentOrder = next[idx].displayOrder;
  next[idx] = { ...next[idx], displayOrder: next[swapIdx].displayOrder };
  next[swapIdx] = { ...next[swapIdx], displayOrder: currentOrder };

  return next;
}

export function loadAllSectionDisplayConfigs(): AllSectionsDisplayConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AllSectionsDisplayConfig>;
      return mergeAllSectionDisplayConfigs(parsed);
    }

    const legacyRaw = localStorage.getItem(LEGACY_DASHBOARD_STORAGE_KEY);
    if (legacyRaw) {
      const legacyParsed = JSON.parse(legacyRaw) as SectionDisplayConfig;
      const merged = buildAllDefaultSectionDisplayConfigs();
      merged.dashboard = mergeSectionDisplayConfig('dashboard', legacyParsed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      localStorage.removeItem(LEGACY_DASHBOARD_STORAGE_KEY);
      return merged;
    }

    return buildAllDefaultSectionDisplayConfigs();
  } catch {
    return buildAllDefaultSectionDisplayConfigs();
  }
}

export function persistAllSectionDisplayConfigs(config: AllSectionsDisplayConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
