import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import type { AlertFilters } from '@/types/alerts';
import { getUnreadCount } from '../api/alert-api';

interface AlertCenterContextValue {
  unreadCount: number;
  refreshUnreadCount: () => void;
  selectedVehicleId: string | null;
  setSelectedVehicleId: (id: string | null) => void;
  filters: AlertFilters;
  setFilters: React.Dispatch<React.SetStateAction<AlertFilters>>;
}

const AlertCenterContext = createContext<AlertCenterContextValue | null>(null);

const defaultFilters: AlertFilters = {
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

export function AlertCenterProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>(defaultFilters);

  const refreshUnreadCount = useCallback(() => {
    setUnreadCount(getUnreadCount());
  }, []);

  return (
    <AlertCenterContext.Provider
      value={{
        unreadCount,
        refreshUnreadCount,
        selectedVehicleId,
        setSelectedVehicleId,
        filters,
        setFilters,
      }}
    >
      {children}
    </AlertCenterContext.Provider>
  );
}

export function useAlertCenterContext() {
  const ctx = useContext(AlertCenterContext);
  if (!ctx) {
    return {
      unreadCount: 0,
      refreshUnreadCount: () => undefined,
      selectedVehicleId: null,
      setSelectedVehicleId: () => undefined,
      filters: defaultFilters,
      setFilters: () => undefined,
    };
  }
  return ctx;
}
