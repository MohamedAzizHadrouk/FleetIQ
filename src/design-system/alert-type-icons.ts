import {
  AlertOctagon,
  Battery,
  Car,
  CircleDot,
  Clock,
  Disc,
  DoorOpen,
  FileText,
  Filter,
  Flame,
  Fuel,
  Gauge,
  Hand,
  KeyRound,
  Lightbulb,
  MapPin,
  Route,
  Shield,
  ShieldCheck,
  ShieldOff,
  Signal,
  Thermometer,
  WifiOff,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { AlertCategory, AlertSeverity, AlertType } from '@/types/alerts';
import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { getSeverityConfig } from '@/design-system/severity';
import { getTaxonomyEntry } from '@/features/alert-center/constants/alert-taxonomy';

export interface AlertTypeIconConfig {
  icon: LucideIcon;
  label: string;
  description: string;
}

const TYPE_ICON_OVERRIDES: Partial<Record<AlertType, LucideIcon>> = {
  sos: Shield,
  gps_signal: MapPin,
  gps_jamming: WifiOff,
  gsm_lost: Signal,
  gps_battery_low: Battery,
  geofence: MapPin,
  geofence_exit: MapPin,
  polygon_exit: MapPin,
  city_exit: MapPin,
  country_border: MapPin,
  route: Route,
  departure_point: Route,
  arrival_point: Route,
  long_stop: Clock,
  abnormal_immobilization: Clock,
  stop: Clock,
  restricted_hours: Clock,
  presence_in_area: Clock,
  absence_from_area: Clock,
  speeding: Gauge,
  tunisian_road_speed_limit: Gauge,
  high_fuel_consumption: Fuel,
  engine_overspeed: Gauge,
  harsh_brake: Zap,
  harsh_accel: Zap,
  harsh_turn: Zap,
  excessive_idle: Clock,
  maintenance_due: Wrench,
  oil_change: Wrench,
  technical_inspection: FileText,
  insurance_expired: FileText,
  registration_expired: FileText,
  documents_expired: FileText,
  car_document: FileText,
  lease_payment: FileText,
  lease_end: FileText,
  mission_order: Clock,
  fuel_coupon: Fuel,
  brake_pads: Disc,
  distribution_chain: Wrench,
  spark_plugs: Zap,
  tires_change: CircleDot,
  fuel_filter: Filter,
  ac_filter: Filter,
  oil_filter: Filter,
  air_filter: Filter,
  accident: AlertOctagon,
  fleet_alert: Car,
  foot_brake: Hand,
  rear_brake: Disc,
  brake_system_failure: Disc,
  door: DoorOpen,
  hood: DoorOpen,
  position_lights: Lightbulb,
  low_beam: Lightbulb,
  high_beam: Lightbulb,
  turn_signals: Lightbulb,
  front_fog: Lightbulb,
  rear_fog: Lightbulb,
  reverse_lights: Lightbulb,
  oil_level: Fuel,
  maintenance: Wrench,
  dashboard_alerts: Gauge,
  clutch: Gauge,
  parking_heater: Flame,
  ev_charging: Battery,
  fuel_source: Fuel,
  pto: Zap,
  remote_arming_enable_ok: ShieldCheck,
  remote_arming_enable_fail: ShieldOff,
  remote_arming_disable_ok: ShieldCheck,
  remote_arming_disable_fail: ShieldOff,
  tank_low: Fuel,
  tank_very_low: Fuel,
  fuel_fill: Fuel,
  stop_contact_on: Car,
  stop_contact_off: Car,
  temperature_alert: Thermometer,
  engine_temperature: Thermometer,
  contact_on_off: KeyRound,
};

const CATEGORY_ICONS: Record<AlertCategory, LucideIcon> = {
  dashboard: Gauge,
  vehicle_management: Wrench,
  geolocation: MapPin,
  driving_quality: Gauge,
  security: Shield,
};

const SUBCATEGORY_ICONS: Record<string, LucideIcon> = {
  Freinage: Disc,
  Portes: DoorOpen,
  Éclairage: Lightbulb,
  Moteur: Wrench,
  Conduite: Shield,
  Énergie: Fuel,
  Entretien: Wrench,
  Documents: FileText,
  Contrats: FileText,
  Incidents: AlertOctagon,
  Zones: MapPin,
  Itinéraire: Route,
  Arrêts: Clock,
  Connectivité: Signal,
};

function resolveIcon(type: AlertType, category: AlertCategory, subcategory: string): LucideIcon {
  const dashboardMatch = DASHBOARD_INDICATORS.find((i) => i.alertTypeId === type);
  if (dashboardMatch) return dashboardMatch.icon;

  if (TYPE_ICON_OVERRIDES[type]) return TYPE_ICON_OVERRIDES[type]!;

  if (SUBCATEGORY_ICONS[subcategory]) return SUBCATEGORY_ICONS[subcategory];

  return CATEGORY_ICONS[category] ?? Gauge;
}

export function getAlertTypeIconConfig(type: AlertType, _severity?: AlertSeverity): AlertTypeIconConfig {
  const entry = getTaxonomyEntry(type);
  const icon = resolveIcon(type, entry.category, entry.subcategory);

  return {
    icon,
    label: entry.label,
    description: entry.recommendedAction,
  };
}

export function getAlertTypeIconConfigWithFallback(
  type: AlertType,
  severity: AlertSeverity = 'warning'
): AlertTypeIconConfig {
  try {
    return getAlertTypeIconConfig(type, severity);
  } catch {
    const sev = getSeverityConfig(severity);
    return {
      icon: sev.icon,
      label: type,
      description: sev.label,
    };
  }
}
