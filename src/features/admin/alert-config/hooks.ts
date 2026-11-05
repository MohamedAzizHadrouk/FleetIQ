import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAlertEquipmentConfig,
  fetchVehicleTree,
  resetAlertEquipmentSection,
  saveAlertEquipmentSection,
} from './api';
import type { AlertConfigSectionId, GeometricShapeAlertConfig } from './types';
import { adminKeys } from '../hooks/useAdminQueries';

export const alertConfigKeys = {
  tree: () => [...adminKeys.all, 'alertConfig', 'tree'] as const,
  config: (equipment: string) =>
    [...adminKeys.all, 'alertConfig', 'equipment', equipment] as const,
};

export function useVehicleTree() {
  return useQuery({
    queryKey: alertConfigKeys.tree(),
    queryFn: fetchVehicleTree,
  });
}

export function useAlertEquipmentConfig(equipment: string | null) {
  return useQuery({
    queryKey: alertConfigKeys.config(equipment ?? ''),
    queryFn: () => fetchAlertEquipmentConfig(equipment as string),
    enabled: Boolean(equipment),
  });
}

export function useSaveAlertSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      equipment,
      section,
      payload,
    }: {
      equipment: string;
      section: AlertConfigSectionId;
      payload:
        | Record<string, boolean | number>
        | {
            wayAlerts: GeometricShapeAlertConfig[];
            polygonAlerts: GeometricShapeAlertConfig[];
            placeAlerts: GeometricShapeAlertConfig[];
          };
    }) => saveAlertEquipmentSection(equipment, section, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: alertConfigKeys.config(vars.equipment) });
    },
  });
}

export function useResetAlertSection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      equipment,
      section,
    }: {
      equipment: string;
      section: AlertConfigSectionId;
    }) => resetAlertEquipmentSection(equipment, section),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: alertConfigKeys.config(vars.equipment) });
    },
  });
}
