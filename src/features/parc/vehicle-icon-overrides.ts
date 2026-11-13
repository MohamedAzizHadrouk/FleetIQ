import { useEffect, useState } from 'react';
import type { VehicleIconType } from './vehicle-types';

/**
 * Vehicle icon chosen by the user in the Parc module, shared with the tracking
 * module (table + map). Keyed by matricule, saved in the browser.
 */
const STORAGE_KEY = 'fiq.vehicleIconOverrides.v1';
const EVENT = 'fiq-vehicle-icon-change';

export type IconOverrides = Record<string, VehicleIconType>;

export const iconKey = (matricule?: string | null) => (matricule ?? '').trim().toUpperCase();

export function readIconOverrides(): IconOverrides {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as IconOverrides) : {};
  } catch {
    return {};
  }
}

export function setVehicleIconOverride(matricule: string, iconType: VehicleIconType) {
  const key = iconKey(matricule);
  if (!key) return;
  const next = { ...readIconOverrides(), [key]: iconType };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the choice still applies for this session */
  }
  window.dispatchEvent(new CustomEvent<IconOverrides>(EVENT, { detail: next }));
}

/** Current overrides, updated live when the user saves a vehicle in Parc */
export function useVehicleIconOverrides(): IconOverrides {
  const [overrides, setOverrides] = useState<IconOverrides>(readIconOverrides);
  useEffect(() => {
    const sync = (e: Event) => setOverrides((e as CustomEvent<IconOverrides>).detail);
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return overrides;
}
