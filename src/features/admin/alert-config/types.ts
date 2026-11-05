export enum SensitivityLevel {
  HighSensitivity = 1,
  MediumSensitivity = 2,
  LowSensitivity = 3,
}

export enum InOutGeometricShapeStatus {
  InOut = 0,
  Out = 1,
  In = 2,
  Unknown = -1,
}

export interface GeometricShapeAlertConfig {
  enableWayAlarm: boolean;
  distanceInM: number;
  dayOfWeeks: number[] | null;
  idPlaceOrGeometricShape: number;
  inOutGeometricShapeStatus: InOutGeometricShapeStatus;
  startTime: string;
  endTime: string;
}

export interface AlertEquipmentConfig {
  equipment: string;
  general: Record<string, boolean | number>;
  temperature: Record<string, boolean | number>;
  fuel: Record<string, boolean | number>;
  speed: Record<string, boolean | number>;
  stop: Record<string, boolean | number>;
  driving: Record<string, boolean | number>;
  geometricShape: {
    wayAlerts: GeometricShapeAlertConfig[];
    polygonAlerts: GeometricShapeAlertConfig[];
    placeAlerts: GeometricShapeAlertConfig[];
  };
}

export type AlertConfigSectionId =
  | 'general'
  | 'temperature'
  | 'fuel'
  | 'speed'
  | 'stop'
  | 'driving'
  | 'geo';

export interface AlertField {
  key: string;
  label: string;
  type: 'toggle' | 'number' | 'select';
  options?: { value: number | string; label: string }[];
  showWhen?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectedVehicle {
  carId: string;
  carName: string;
  departmentId: string;
  departmentName: string;
}

export interface DeptWithCars {
  id: string;
  name: string;
  cars: { id: string; name: string }[];
}
