import {
  Hand,
  Package,
  Fuel,
  Shield,
  Wind,
  Lock,
  DoorOpen,
  Battery,
  Droplets,
  Thermometer,
  Wrench,
  LifeBuoy,
  Disc,
  Gauge,
  Lightbulb,
  Flame,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AlertType } from '@/types/alerts';

export interface DashboardIndicatorConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  alertTypeId: AlertType;
  visibleOnCard: boolean;
}

/**
 * Board-table catalog aligned with Webtrace (~37) plus FleetIQ extras (e.g. main_lights).
 * Card strip still uses `visibleOnCard` subset.
 */
export const DASHBOARD_INDICATORS: DashboardIndicatorConfig[] = [
  { id: 'fuel', label: 'Carburant bas', shortLabel: 'FU', icon: Fuel, alertTypeId: 'fuel', visibleOnCard: true },
  { id: 'seatbelt', label: 'Ceinture conducteur', shortLabel: 'CE', icon: Shield, alertTypeId: 'seatbelt', visibleOnCard: true },
  { id: 'ac', label: 'Climatisation', shortLabel: 'CL', icon: Wind, alertTypeId: 'ac', visibleOnCard: true },
  { id: 'cruise_control', label: 'Régulateur vitesse', shortLabel: 'RV', icon: Gauge, alertTypeId: 'cruise_control', visibleOnCard: true },
  { id: 'foot_brake', label: 'Frein à pied', shortLabel: 'FP', icon: Hand, alertTypeId: 'foot_brake', visibleOnCard: false },
  { id: 'clutch', label: 'Pédale embrayage', shortLabel: 'EM', icon: Gauge, alertTypeId: 'clutch', visibleOnCard: false },
  { id: 'handbrake', label: 'Frein à main', shortLabel: 'FM', icon: Hand, alertTypeId: 'handbrake', visibleOnCard: true },
  { id: 'central_lock', label: 'Fermeture centrale', shortLabel: 'FC', icon: Lock, alertTypeId: 'central_lock', visibleOnCard: true },
  { id: 'reverse_lights', label: 'Marche arrière', shortLabel: 'MA', icon: Lightbulb, alertTypeId: 'reverse_lights', visibleOnCard: false },
  { id: 'position_lights', label: 'Feux de position', shortLabel: 'PO', icon: Lightbulb, alertTypeId: 'position_lights', visibleOnCard: false },
  { id: 'low_beam', label: 'Feux de croisement', shortLabel: 'CR', icon: Lightbulb, alertTypeId: 'low_beam', visibleOnCard: false },
  { id: 'high_beam', label: 'Feux de route', shortLabel: 'RO', icon: Lightbulb, alertTypeId: 'high_beam', visibleOnCard: false },
  { id: 'rear_fog', label: 'Feu brouillard arrière', shortLabel: 'BA', icon: Lightbulb, alertTypeId: 'rear_fog', visibleOnCard: false },
  { id: 'front_fog', label: 'Feu brouillard avant', shortLabel: 'BF', icon: Lightbulb, alertTypeId: 'front_fog', visibleOnCard: false },
  { id: 'door', label: 'Portes', shortLabel: 'PT', icon: DoorOpen, alertTypeId: 'door', visibleOnCard: false },
  { id: 'trunk', label: 'Coffre', shortLabel: 'CF', icon: Package, alertTypeId: 'trunk', visibleOnCard: true },
  { id: 'turn_signals', label: 'Feux clignotants', shortLabel: 'CL', icon: Lightbulb, alertTypeId: 'turn_signals', visibleOnCard: false },
  { id: 'driver_door', label: 'Porte conducteur', shortLabel: 'PC', icon: DoorOpen, alertTypeId: 'driver_door', visibleOnCard: true },
  { id: 'front_right_door', label: 'Porte passager', shortLabel: 'PD', icon: DoorOpen, alertTypeId: 'front_right_door', visibleOnCard: true },
  { id: 'rear_left_door', label: 'Porte arrière gauche', shortLabel: 'PG', icon: DoorOpen, alertTypeId: 'rear_left_door', visibleOnCard: true },
  { id: 'rear_right_door', label: 'Porte arrière droite', shortLabel: 'PR', icon: DoorOpen, alertTypeId: 'rear_right_door', visibleOnCard: true },
  { id: 'hood', label: 'Capot', shortLabel: 'CA', icon: Package, alertTypeId: 'hood', visibleOnCard: false },
  { id: 'parking_heater', label: 'Chauffage stationnement', shortLabel: 'CS', icon: Flame, alertTypeId: 'parking_heater', visibleOnCard: false },
  { id: 'brake_fluid_level', label: 'Liquide frein', shortLabel: 'LF', icon: Droplets, alertTypeId: 'brake_fluid_level', visibleOnCard: true },
  { id: 'coolant_level', label: 'Liquide refroidissement', shortLabel: 'LR', icon: Droplets, alertTypeId: 'coolant_level', visibleOnCard: true },
  { id: 'battery', label: 'Batterie', shortLabel: 'BA', icon: Battery, alertTypeId: 'battery', visibleOnCard: true },
  { id: 'brake_system_failure', label: 'Panne système freinage', shortLabel: 'PF', icon: Disc, alertTypeId: 'brake_system_failure', visibleOnCard: false },
  { id: 'oil_pressure', label: 'Pression huile', shortLabel: 'PH', icon: Droplets, alertTypeId: 'oil_pressure', visibleOnCard: true },
  { id: 'temperature', label: 'Temp. moteur', shortLabel: 'TM', icon: Thermometer, alertTypeId: 'temperature', visibleOnCard: true },
  { id: 'abs', label: 'ABS', shortLabel: 'AB', icon: Disc, alertTypeId: 'abs', visibleOnCard: true },
  { id: 'check_engine', label: 'Check Engine', shortLabel: 'CE', icon: Wrench, alertTypeId: 'check_engine', visibleOnCard: true },
  { id: 'airbag', label: 'Airbag', shortLabel: 'AB', icon: LifeBuoy, alertTypeId: 'airbag', visibleOnCard: true },
  { id: 'maintenance', label: 'Appel de service', shortLabel: 'AS', icon: Wrench, alertTypeId: 'maintenance', visibleOnCard: false },
  { id: 'oil_level', label: 'Niveau huile', shortLabel: 'NH', icon: Droplets, alertTypeId: 'oil_level', visibleOnCard: false },
  { id: 'ev_charging', label: 'Recharge VE', shortLabel: 'VE', icon: Battery, alertTypeId: 'ev_charging', visibleOnCard: false },
  { id: 'fuel_source', label: 'Source carburant', shortLabel: 'SC', icon: Fuel, alertTypeId: 'fuel_source', visibleOnCard: false },
  { id: 'pto', label: 'Power take-off', shortLabel: 'PT', icon: Zap, alertTypeId: 'pto', visibleOnCard: false },
  // FleetIQ extras retained
  { id: 'main_lights', label: 'Feux principaux', shortLabel: 'FP', icon: Lightbulb, alertTypeId: 'main_lights', visibleOnCard: true },
];

export const CARD_DASHBOARD_INDICATORS = DASHBOARD_INDICATORS.filter((i) => i.visibleOnCard);

export function getDashboardIndicator(id: string): DashboardIndicatorConfig | undefined {
  return DASHBOARD_INDICATORS.find((i) => i.id === id);
}

export const INDICATOR_SEVERITY_COLORS = {
  critical: 'text-rose-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  inactive: 'text-slate-300',
} as const;
