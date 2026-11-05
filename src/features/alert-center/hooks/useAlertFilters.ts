import { useState, useCallback, useMemo } from 'react';
import type { AlertFilters } from '@/types/alerts';

const DEFAULT_FILTERS: AlertFilters = {
  vehicleIds: [],
  categories: [],
  severities: [],
  vehicleStates: [],
  dashboardIndicatorIds: [],
  departmentIds: [],
  gpsStatuses: [],
  movementStates: [],
  datePreset: undefined,
  selectedDate: undefined,
};

export function useAlertFilters() {
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_FILTERS);

  const updateFilter = useCallback(<K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.vehicleIds.length) count++;
    if (filters.severities.length) count++;
    if (filters.vehicleStates.length) count++;
    if (filters.dashboardIndicatorIds.length) count++;
    if (filters.departmentIds.length) count++;
    if (filters.gpsStatuses.length) count++;
    if (filters.movementStates.length) count++;
    if (filters.datePreset) count++;
    if (filters.selectedDate) count++;
    return count;
  }, [filters]);

  return { filters, setFilters, updateFilter, resetFilters, activeFilterCount };
}
