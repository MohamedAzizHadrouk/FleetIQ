import type { AlertSeverity, AlertType } from './alerts';

export type SeverityLevelId = AlertSeverity | string;

export interface CustomSeverityLevel {
  id: string;
  label: string;
  color: string;
  order: number;
}

export interface BuiltinSeverityOverride {
  severity: AlertSeverity;
  label?: string;
  color?: string;
}

export interface SeverityOption {
  id: SeverityLevelId;
  label: string;
  color: string;
  isCustom: boolean;
}

export type AlertScopeType = 'vehicle' | 'group' | 'department';

export type AlertRecipientRole = 'administrator' | 'driver' | 'fleet_manager' | 'user';

export type AlertConfigChannel = 'email' | 'sms' | 'push';

export type ActivationType = 'permanent' | 'temporary';

export interface AlertScopeRef {
  scopeType: AlertScopeType;
  scopeId: string;
}

export interface ThresholdConfig {
  value?: number;
  unit?: string;
  durationMinutes?: number;
}

export interface AlertScopeConfig {
  id: string;
  scopeType: AlertScopeType;
  scopeId: string;
  alertType: AlertType;
  enabled: boolean;
  severity: SeverityLevelId;
  displayOrder?: number;
  alertWhenContactOn?: boolean;
  activationType: ActivationType;
  activationStart?: string;
  activationEnd?: string;
  thresholdConfig?: ThresholdConfig;
}

export interface GeofenceAlertRule {
  id: string;
  name: string;
  zoneLabel: string;
  eventType: 'entry' | 'exit' | 'both';
  severity: SeverityLevelId;
  enabled: boolean;
  scopeType: AlertScopeType;
  scopeIds: string[];
  activationType: ActivationType;
  activationStart?: string;
  activationEnd?: string;
}

export interface SeverityNotificationPolicy {
  severity: SeverityLevelId;
  roles: AlertRecipientRole[];
  userIds: string[];
  channels: AlertConfigChannel[];
}

export interface AlertNotificationContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: AlertRecipientRole;
  driverId?: string;
  vehicleIds: string[];
}

export interface NamedUser {
  id: string;
  name: string;
  role: AlertRecipientRole;
}

export interface DepartmentEntity {
  id: string;
  name: string;
  type: 'simple' | 'groupe';
  level: 'racine' | 'branche';
  parentId?: string;
  vehicleIds: string[];
}

export interface VehicleGroupEntity {
  id: string;
  name: string;
  description?: string;
  vehicleIds: string[];
}

export interface OrgStructure {
  departments: DepartmentEntity[];
  groups: VehicleGroupEntity[];
}

export type ResolvedAlertState = 'active' | 'inactive' | 'partial';

export interface ResolvedAlertConfig {
  alertType: AlertType;
  state: ResolvedAlertState;
  enabled: boolean;
  severity: SeverityLevelId;
  displayOrder?: number;
  alertWhenContactOn?: boolean;
  activationType: ActivationType;
  activationStart?: string;
  activationEnd?: string;
  thresholdConfig?: ThresholdConfig;
}

export interface DefaultAlertConfigTemplate {
  updatedAt: string;
  sourceScope: AlertScopeRef;
  scopeConfigs: Omit<AlertScopeConfig, 'id' | 'scopeType' | 'scopeId'>[];
  geofenceRules: Omit<GeofenceAlertRule, 'id'>[];
}

export const ALERT_RECIPIENT_ROLE_LABELS: Record<AlertRecipientRole, string> = {
  administrator: 'Administrateur',
  driver: 'Chauffeur',
  fleet_manager: 'Responsable Parc',
  user: 'User',
};

export const ALERT_SCOPE_TYPE_LABELS: Record<AlertScopeType, string> = {
  vehicle: 'Véhicule',
  group: 'Groupe de véhicules',
  department: 'Département',
};
