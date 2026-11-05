import {
  Activity,
  AlarmClock,
  Battery,
  DoorOpen,
  Fuel,
  Gauge,
  MapPin,
  Navigation,
  Route,
  Shield,
  Signal,
  Thermometer,
  User,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import type { HealthIndicatorStatus, IndicatorType } from '@/types/alerts';

export interface IndicatorConfig {
  type: IndicatorType;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const VEHICLE_INDICATORS: IndicatorConfig[] = [
  { type: 'engine', label: 'Moteur', shortLabel: 'MOT', icon: Gauge },
  { type: 'gps', label: 'GPS', shortLabel: 'GPS', icon: MapPin },
  { type: 'battery', label: 'Batterie', shortLabel: 'BAT', icon: Battery },
  { type: 'fuel', label: 'Carburant', shortLabel: 'FUEL', icon: Fuel },
  { type: 'temperature', label: 'Température', shortLabel: 'TEMP', icon: Thermometer },
  { type: 'doors', label: 'Portes', shortLabel: 'DR', icon: DoorOpen },
  { type: 'alarm', label: 'Alarme', shortLabel: 'ALM', icon: AlarmClock },
  { type: 'gnss', label: 'GNSS', shortLabel: 'GNSS', icon: Navigation },
  { type: 'network', label: 'Réseau', shortLabel: 'NET', icon: Signal },
  { type: 'sos', label: 'SOS', shortLabel: 'SOS', icon: Shield },
  { type: 'maintenance', label: 'Maintenance', shortLabel: 'MNT', icon: Wrench },
  { type: 'tires', label: 'Pneus', shortLabel: 'TIR', icon: Activity },
  { type: 'driver', label: 'Conducteur', shortLabel: 'DRV', icon: User },
  { type: 'route', label: 'Mission / Route', shortLabel: 'RTE', icon: Route },
];

export const INDICATOR_STATUS_COLORS: Record<HealthIndicatorStatus, string> = {
  ok: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-rose-500',
  offline: 'bg-slate-400',
  unknown: 'bg-slate-300',
};

export const INDICATOR_STATUS_RING: Record<HealthIndicatorStatus, string> = {
  ok: 'ring-emerald-200',
  warning: 'ring-amber-200',
  critical: 'ring-rose-300',
  offline: 'ring-slate-200',
  unknown: 'ring-slate-100',
};

export function getIndicatorConfig(type: IndicatorType): IndicatorConfig {
  return VEHICLE_INDICATORS.find((i) => i.type === type) ?? VEHICLE_INDICATORS[0];
}
