import type {
  AlertCategory,
  AlertPriority,
  AlertSeverity,
  AlertType,
  BusinessImpact,
  NotificationChannel,
} from '@/types/alerts';
import { getTaxonomyEntry, type AlertTaxonomyEntry } from './alert-taxonomy';

export interface AlertTypeRegistryEntry {
  label: string;
  category: AlertCategory;
  defaultSeverity: AlertSeverity;
  defaultPriority: AlertPriority;
  businessImpact: BusinessImpact;
  recommendedAction: string;
  autoResolvable: boolean;
  requiresAcknowledgement: boolean;
  notificationChannels: NotificationChannel[];
}

function toRegistryEntry(entry: AlertTaxonomyEntry): AlertTypeRegistryEntry {
  return {
    label: entry.label,
    category: entry.category,
    defaultSeverity: entry.defaultSeverity,
    defaultPriority: entry.defaultPriority,
    businessImpact: entry.businessImpact,
    recommendedAction: entry.recommendedAction,
    autoResolvable: entry.autoResolvable,
    requiresAcknowledgement: entry.requiresAcknowledgement,
    notificationChannels: entry.notificationChannels,
  };
}

export function getAlertTypeConfig(type: AlertType): AlertTypeRegistryEntry {
  return toRegistryEntry(getTaxonomyEntry(type));
}

export function getAlertTypeLabel(type: AlertType): string {
  return getTaxonomyEntry(type).label;
}

/** @deprecated Use ALERT_TAXONOMY from alert-taxonomy.ts */
export const ALERT_TYPE_REGISTRY: Partial<Record<AlertType, AlertTypeRegistryEntry>> = {};
