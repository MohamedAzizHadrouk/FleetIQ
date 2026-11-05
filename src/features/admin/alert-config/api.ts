import { delay } from '@/lib/utils';
import { INITIAL_DEPARTMENTS } from '../mocks/mockDepartments';
import { MOCK_ADMIN_VEHICLES } from '../mocks/mockVehicles';
import { createDefaultEquipmentConfig } from './defaults';
import type {
  AlertConfigSectionId,
  AlertEquipmentConfig,
  DeptWithCars,
  GeometricShapeAlertConfig,
} from './types';

const configStore = new Map<string, AlertEquipmentConfig>();

export async function fetchVehicleTree(): Promise<DeptWithCars[]> {
  await delay(150);
  return INITIAL_DEPARTMENTS.map((d) => ({
    id: d.id,
    name: d.name,
    cars: d.vehicleIds.map((id) => {
      const v = MOCK_ADMIN_VEHICLES.find((x) => x.id === id);
      return { id, name: v?.name ?? id };
    }),
  }));
}

export async function fetchAlertEquipmentConfig(
  equipment: string
): Promise<AlertEquipmentConfig> {
  await delay(280);
  const existing = configStore.get(equipment);
  if (existing) return structuredClone(existing);
  const created = createDefaultEquipmentConfig(equipment);
  configStore.set(equipment, created);
  return structuredClone(created);
}

export async function saveAlertEquipmentSection(
  equipment: string,
  section: AlertConfigSectionId,
  payload:
    | Record<string, boolean | number>
    | {
        wayAlerts: GeometricShapeAlertConfig[];
        polygonAlerts: GeometricShapeAlertConfig[];
        placeAlerts: GeometricShapeAlertConfig[];
      }
): Promise<void> {
  await delay(250);
  const current =
    configStore.get(equipment) ?? createDefaultEquipmentConfig(equipment);
  if (section === 'geo') {
    current.geometricShape = payload as AlertEquipmentConfig['geometricShape'];
  } else {
    current[section] = payload as Record<string, boolean | number>;
  }
  configStore.set(equipment, current);
}

export async function resetAlertEquipmentSection(
  equipment: string,
  section: AlertConfigSectionId
): Promise<AlertEquipmentConfig> {
  await delay(150);
  const defaults = createDefaultEquipmentConfig(equipment);
  const current =
    configStore.get(equipment) ?? createDefaultEquipmentConfig(equipment);
  if (section === 'geo') {
    current.geometricShape = defaults.geometricShape;
  } else {
    current[section] = defaults[section];
  }
  configStore.set(equipment, current);
  return structuredClone(current);
}
