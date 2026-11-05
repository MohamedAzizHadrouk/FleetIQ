import type { VehicleIconType } from '@/features/parc/vehicle-types';

export type VehicleStatus = 'active' | 'idle' | 'offline';

export interface Vehicle {
  id: string;
  name: string;
  status: VehicleStatus;
  speed: number; // km/h
  location: string;
  coordinates: [number, number]; // [lat, lng]
  lastUpdate: string;
  driver: string;
  batteryLevel: number;
  departmentId?: string;
  groupIds?: string[];
  matricule?: string;
  /** Equipment IMEI — absent means no device assigned */
  imei?: string;
  /** HardwareSupportCurrentPosition */
  supportsCurrentPosition?: boolean;
  /** Output Arming / AAD */
  supportsAad?: boolean;
  /** Forced AAD while moving */
  supportsAadForced?: boolean;
  iconType?: VehicleIconType;
  /** Degrees 0–360, 0 = north, clockwise */
  heading?: number;
  /** Optional live telemetry exposed by the tracking equipment. */
  mileage?: number;
  engineHours?: number | string;
  engineTemperature?: number;
  fuelLevel?: number;
  fuelVolume?: number;
  fuelConsumption?: number;
  driverId?: string;
  drivingTime?: string;
  serialNumber?: string;
  chipNumber?: string;
  temperature?: number;
  probeState?: string;
  waterPresence?: boolean;
  timestamp?: string;
  cardId?: string;
  /** External power supply voltage seen by the tracker (V) */
  powerVoltage?: number;
}

export type DurationUnit = 'days' | 'weeks' | 'months';

export interface DynamicDuration {
  type: 'relative' | 'fixed';
  // For relative dates
  unit?: DurationUnit;
  value?: number;
  // For fixed dates
  dateDebut?: string;
  dateFin?: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  vehicles: string[];
  duration: DynamicDuration;
  isDefault: boolean;
  createdAt: string;
  // Additional fields for report forms
  formData?: {
    [key: string]: any;
  };
}

export * from './alerts';
export * from './alert-config';
export * from './map-overlays';
