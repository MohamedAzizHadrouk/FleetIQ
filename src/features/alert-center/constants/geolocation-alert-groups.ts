import type { AlertType } from '@/types/alerts';
import { ALERT_TAXONOMY } from './alert-taxonomy';

export interface GeolocationAlertGroup {
  id: string;
  label: string;
  alertTypes: AlertType[];
}

const GEOLOCATION_TYPES = Object.values(ALERT_TAXONOMY)
  .filter((e) => e.id !== 'all' && e.id !== 'unknown' && e.category === 'geolocation')
  .map((e) => e.id);

const GROUP_ORDER = ['Zones', 'Itinéraire', 'Arrêts'] as const;

export function getGeolocationAlertTypes(): AlertType[] {
  return GEOLOCATION_TYPES;
}

export function getGeolocationAlertGroups(): GeolocationAlertGroup[] {
  const bySubcategory = new Map<string, AlertType[]>();

  for (const type of GEOLOCATION_TYPES) {
    const entry = ALERT_TAXONOMY[type];
    const sub = entry?.subcategory ?? 'Autres';
    const list = bySubcategory.get(sub) ?? [];
    list.push(type);
    bySubcategory.set(sub, list);
  }

  const ordered: GeolocationAlertGroup[] = [];
  for (const label of GROUP_ORDER) {
    const types = bySubcategory.get(label);
    if (types?.length) {
      ordered.push({ id: label.toLowerCase().replace(/\s+/g, '_'), label, alertTypes: types });
      bySubcategory.delete(label);
    }
  }

  for (const [label, alertTypes] of bySubcategory) {
    ordered.push({ id: label.toLowerCase().replace(/\s+/g, '_'), label, alertTypes });
  }

  return ordered;
}
