export type AlertCategory =
  | 'dashboard'
  | 'vehicle_management'
  | 'geolocation'
  | 'driving_quality'
  | 'security';

export type AlertStatus = 'active' | 'resolved';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

export type HealthIndicatorStatus = 'ok' | 'warning' | 'critical' | 'offline' | 'unknown';

export type IndicatorType =
  | 'engine'
  | 'gps'
  | 'battery'
  | 'fuel'
  | 'temperature'
  | 'doors'
  | 'alarm'
  | 'gnss'
  | 'network'
  | 'sos'
  | 'maintenance'
  | 'tires'
  | 'driver'
  | 'route';

export type BusinessImpact = 'high' | 'medium' | 'low';

export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'whatsapp';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertType =
  | 'all'
  // Dashboard — braking
  | 'handbrake'
  | 'foot_brake'
  | 'rear_brake'
  | 'brake_system_failure'
  | 'abs'
  // Dashboard — doors
  | 'trunk'
  | 'driver_door'
  | 'front_right_door'
  | 'rear_left_door'
  | 'rear_right_door'
  | 'door'
  | 'hood'
  // Dashboard — lighting
  | 'position_lights'
  | 'low_beam'
  | 'high_beam'
  | 'turn_signals'
  | 'front_fog'
  | 'rear_fog'
  | 'reverse_lights'
  // Dashboard — engine
  | 'check_engine'
  | 'temperature'
  | 'oil_pressure'
  | 'oil_level'
  | 'battery'
  | 'airbag'
  | 'coolant_level'
  | 'brake_fluid_level'
  | 'maintenance'
  | 'dashboard_alerts'
  // Dashboard — driving
  | 'seatbelt'
  | 'cruise_control'
  | 'clutch'
  | 'ac'
  | 'parking_heater'
  // Dashboard — energy
  | 'fuel'
  | 'ev_charging'
  | 'fuel_source'
  | 'pto'
  | 'central_lock'
  | 'main_lights'
  // Vehicle management
  | 'maintenance_due'
  | 'oil_change'
  | 'technical_inspection'
  | 'insurance_expired'
  | 'registration_expired'
  | 'documents_expired'
  | 'lease_payment'
  | 'accident'
  | 'lease_end'
  | 'mission_order'
  | 'fuel_coupon'
  | 'brake_pads'
  | 'distribution_chain'
  | 'spark_plugs'
  | 'tires_change'
  | 'fuel_filter'
  | 'ac_filter'
  | 'oil_filter'
  | 'air_filter'
  | 'car_document'
  // Geolocation
  | 'geofence'
  | 'geofence_exit'
  | 'polygon_exit'
  | 'city_exit'
  | 'route'
  | 'departure_point'
  | 'arrival_point'
  | 'restricted_hours'
  | 'long_stop'
  | 'abnormal_immobilization'
  | 'country_border'
  | 'stop'
  | 'presence_in_area'
  | 'absence_from_area'
  // Driving quality
  | 'speeding'
  | 'harsh_brake'
  | 'harsh_accel'
  | 'harsh_turn'
  | 'hard_deceleration'
  | 'excessive_idle'
  | 'aggressive_driving'
  | 'engine_overspeed'
  | 'driving_time_exceeded'
  | 'tunisian_road_speed_limit'
  | 'high_fuel_consumption'
  // Security
  | 'gps_signal'
  | 'gsm_lost'
  | 'gps_battery_low'
  | 'gps_jamming'
  | 'battery_disconnected'
  | 'towing'
  | 'unauthorized_start'
  | 'fuel_theft'
  | 'removal'
  | 'power_cut'
  | 'sos'
  | 'remote_arming_enable_ok'
  | 'remote_arming_enable_fail'
  | 'remote_arming_disable_ok'
  | 'remote_arming_disable_fail'
  | 'tank_low'
  | 'tank_very_low'
  | 'fuel_fill'
  | 'stop_contact_on'
  | 'stop_contact_off'
  | 'temperature_alert'
  | 'engine_temperature'
  | 'contact_on_off'
  // Operational / legacy
  | 'ignition'
  | 'taxi_status'
  | 'message_received'
  | 'driver_identification'
  | 'fleet_alert'
  | 'photo_received'
  | 'unknown';

export type VehicleFilterState = 'with_alerts' | 'without_alerts';

export type GpsFilterStatus = 'online' | 'offline';

export type MovementFilterState = 'moving' | 'stopped';

export type DateRangePreset = 'today' | '24h' | '7d';

export type DashboardIndicatorStatus = 'active' | 'inactive';

export interface DashboardIndicatorState {
  id: string;
  status: DashboardIndicatorStatus;
  severity?: AlertSeverity;
  label: string;
}

export interface AlertTypeConfig {
  id: AlertType;
  label: string;
  icon: string;
  severity: AlertSeverity;
}

export interface Alert {
  id: string;
  type: AlertType;
  vehicleId: string;
  vehicleName: string;
  severity: AlertSeverity;
  message: string;
  timestamp: string;
  location?: string;
  isRead: boolean;
  details?: Record<string, unknown>;
}

export interface FleetAlert extends Alert {
  category: AlertCategory;
  status: AlertStatus;
  priority: AlertPriority;
  driverName?: string;
  fleetName?: string;
  speed?: number;
  missionName?: string;
  coordinates?: [number, number];
  recommendedAction: string;
  autoResolvable: boolean;
  businessImpact: BusinessImpact;
  createdAt: string;
  notifiedUser?: string;
  isActive?: boolean;
}

export interface VehicleAlertConfig {
  vehicleId: string;
  enabledAlerts: Set<AlertType>;
  alertSettings: Partial<
    Record<
      AlertType,
      {
        enabled: boolean;
        threshold?: number;
        notifyEmail?: boolean;
        notifySMS?: boolean;
      }
    >
  >;
}

export interface VehicleHealthSnapshot {
  vehicleId: string;
  vehicleName: string;
  driverName: string;
  fleetName: string;
  licensePlate?: string;
  indicators: Record<IndicatorType, HealthIndicatorStatus>;
  dashboardIndicators: Record<string, DashboardIndicatorState>;
  overallScore: number;
  alertCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  status: 'active' | 'idle' | 'offline';
  ignitionOn: boolean;
  isMoving: boolean;
  lastCommunication: string;
  location: string;
  coordinates: [number, number];
  gpsStatus: 'online' | 'offline';
}

export interface VehicleAlertSummary {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  driverName: string;
  fleetName: string;
  status: 'active' | 'idle' | 'offline';
  gpsStatus: 'online' | 'offline';
  lastCommunication: string;
  location: string;
  coordinates: [number, number];
  ignitionOn: boolean;
  isMoving: boolean;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalAlerts: number;
  dashboardIndicators: Record<string, DashboardIndicatorState>;
  overallScore: number;
}

export interface VehicleAlertItem {
  type: AlertType;
  label: string;
  category: AlertCategory;
  severity: AlertSeverity;
  isActive: boolean;
  status: AlertStatus;
  message?: string;
  notifiedUser?: string;
  alertId?: string;
}

export interface TimelineEvent {
  id: string;
  time: string;
  date: string;
  type: AlertType;
  label: string;
  description: string;
  severity: AlertSeverity;
  category: AlertCategory;
  notifiedUser?: string;
  coordinates?: [number, number];
  vehicleId?: string;
  vehicleName?: string;
}

export interface AlertKpiData {
  critical: number;
  high: number;
  medium: number;
  resolvedToday: number;
  vehiclesInAlert: number;
  total: number;
  trends: {
    critical: number;
    high: number;
    medium: number;
    resolvedToday: number;
    vehiclesInAlert: number;
    total: number;
  };
}

export interface AlertCenterSummary {
  vehiclesInAlert: number;
  activeSosVehicles: number;
  vehiclesOffline: number;
}

export interface FleetStatusVehicleItem {
  vehicleId: string;
  vehicleName: string;
  licensePlate?: string;
  driverName?: string;
  detail?: string;
}

export interface FleetOverviewData {
  vehiclesOnline: number;
  vehiclesOffline: number;
  activeSosCount: number;
  onlineVehicles: FleetStatusVehicleItem[];
  offlineVehicles: FleetStatusVehicleItem[];
  sosVehicles: FleetStatusVehicleItem[];
  upcomingMaintenance: { id: string; vehicleName: string; dueIn: string; type: string }[];
  topRiskVehicles: {
    vehicleId: string;
    vehicleName: string;
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  }[];
}

export interface AlertAnalyticsData {
  byCategory: { name: string; count: number }[];
  byVehicle: { name: string; count: number }[];
  byDriver: { name: string; count: number }[];
  byHour: { hour: string; count: number }[];
  byDay: { day: string; count: number }[];
  avgResolutionMinutes: number;
}

export interface AlertFilters {
  vehicleIds: string[];
  categories: AlertCategory[];
  severities: AlertSeverity[];
  vehicleStates: VehicleFilterState[];
  dashboardIndicatorIds: string[];
  departmentIds: string[];
  gpsStatuses: GpsFilterStatus[];
  movementStates: MovementFilterState[];
  datePreset?: DateRangePreset;
  selectedDate?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  active: boolean;
  vehicleScope: 'all' | 'group' | 'vehicle';
  vehicleGroupId?: string;
  vehicleId?: string;
  category: AlertCategory;
  alertType: AlertType;
  severity: AlertSeverity;
  conditionValue?: number;
  conditionThreshold?: number;
  conditionDuration?: number;
  activationType: 'permanent' | 'temporary';
  activationStart?: string;
  activationEnd?: string;
  notifyRoles: string[];
  notifyChannels: NotificationChannel[];
  createdAt: string;
}
