import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getColumnDefs,
  getDefaultOrder,
  getDefaultVisibility,
  type SuivieAction,
} from './column-defs';

export interface ColumnPreferences {
  order: string[];
  visible: Record<string, boolean>;
}

function storageKey(action: SuivieAction): string {
  return `fleetiq.suivie.columns.${action}`;
}

function buildDefaults(action: SuivieAction): ColumnPreferences {
  return {
    order: getDefaultOrder(action),
    visible: getDefaultVisibility(action),
  };
}

function mergeWithDefaults(
  action: SuivieAction,
  stored: Partial<ColumnPreferences> | null
): ColumnPreferences {
  const defaults = buildDefaults(action);
  const knownIds = new Set(defaults.order);

  const order = (stored?.order ?? [])
    .filter((id) => knownIds.has(id))
    .concat(defaults.order.filter((id) => !(stored?.order ?? []).includes(id)));

  const visible: Record<string, boolean> = { ...defaults.visible };
  if (stored?.visible) {
    for (const id of knownIds) {
      if (typeof stored.visible[id] === 'boolean') {
        visible[id] = stored.visible[id];
      }
    }
  }

  // Ensure at least one visible
  if (!Object.values(visible).some(Boolean)) {
    const first = defaults.order[0];
    if (first) visible[first] = true;
  }

  return { order, visible };
}

function loadPrefs(action: SuivieAction): ColumnPreferences {
  try {
    const raw = localStorage.getItem(storageKey(action));
    if (!raw) return buildDefaults(action);
    return mergeWithDefaults(action, JSON.parse(raw) as Partial<ColumnPreferences>);
  } catch {
    return buildDefaults(action);
  }
}

function savePrefs(action: SuivieAction, prefs: ColumnPreferences) {
  try {
    localStorage.setItem(storageKey(action), JSON.stringify(prefs));
  } catch {
    // ignore quota / private mode
  }
}

export function useColumnPreferences(action: SuivieAction) {
  const [prefs, setPrefs] = useState<ColumnPreferences>(() => loadPrefs(action));

  useEffect(() => {
    setPrefs(loadPrefs(action));
  }, [action]);

  const persist = useCallback(
    (next: ColumnPreferences) => {
      setPrefs(next);
      savePrefs(action, next);
    },
    [action]
  );

  const toggleVisible = useCallback(
    (columnId: string) => {
      setPrefs((prev) => {
        const currentlyVisible = Object.entries(prev.visible)
          .filter(([, v]) => v)
          .map(([id]) => id);
        const turningOff =
          prev.visible[columnId] && currentlyVisible.length <= 1;
        if (turningOff) return prev;

        const next: ColumnPreferences = {
          ...prev,
          visible: {
            ...prev.visible,
            [columnId]: !prev.visible[columnId],
          },
        };
        savePrefs(action, next);
        return next;
      });
    },
    [action]
  );

  const reorder = useCallback(
    (activeId: string, overId: string) => {
      setPrefs((prev) => {
        const visibleOrdered = prev.order.filter((id) => prev.visible[id]);
        const from = visibleOrdered.indexOf(activeId);
        const to = visibleOrdered.indexOf(overId);
        if (from < 0 || to < 0 || from === to) return prev;

        const nextVisible = [...visibleOrdered];
        const [moved] = nextVisible.splice(from, 1);
        nextVisible.splice(to, 0, moved);

        // Rebuild full order: visible in new order, then hidden in previous relative order
        const hidden = prev.order.filter((id) => !prev.visible[id]);
        const next: ColumnPreferences = {
          ...prev,
          order: [...nextVisible, ...hidden],
        };
        savePrefs(action, next);
        return next;
      });
    },
    [action]
  );

  const resetToDefault = useCallback(() => {
    persist(buildDefaults(action));
  }, [action, persist]);

  const visibleColumns = useMemo(() => {
    const defs = getColumnDefs(action);
    const byId = Object.fromEntries(defs.map((d) => [d.id, d]));
    return prefs.order
      .filter((id) => prefs.visible[id] && byId[id])
      .map((id) => byId[id]);
  }, [action, prefs]);

  const allColumns = useMemo(() => {
    const defs = getColumnDefs(action);
    const byId = Object.fromEntries(defs.map((d) => [d.id, d]));
    return prefs.order.filter((id) => byId[id]).map((id) => byId[id]);
  }, [action, prefs]);

  return {
    prefs,
    visibleColumns,
    allColumns,
    toggleVisible,
    reorder,
    resetToDefault,
  };
}
