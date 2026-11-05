import type { AlertType } from '@/types/alerts';

export interface SecurityAlertGroup {
  id: string;
  label: string;
  alertTypes: AlertType[];
}

/** Types excluded from security config — non-GPS or redundant behavior alerts */
export const EXCLUDED_SECURITY_ALERT_TYPES: AlertType[] = [
  'aggressive_driving',
  'gps_battery_low',
  'gps_jamming',
  'power_cut',
  'removal',
];

export const SECURITY_ALERT_GROUPS: SecurityAlertGroup[] = [
  {
    id: 'connectivity',
    label: 'Connectivité',
    alertTypes: ['gps_signal', 'gsm_lost'],
  },
  {
    id: 'protection',
    label: 'Protection',
    alertTypes: ['battery_disconnected', 'towing', 'unauthorized_start', 'fuel_theft'],
  },
  {
    id: 'remote_arming',
    label: 'Commandes à distance',
    alertTypes: [
      'remote_arming_enable_ok',
      'remote_arming_enable_fail',
      'remote_arming_disable_ok',
      'remote_arming_disable_fail',
    ],
  },
  {
    id: 'fuel',
    label: 'Carburant',
    alertTypes: ['tank_low', 'tank_very_low', 'fuel_fill'],
  },
  {
    id: 'stops',
    label: 'Arrêts',
    alertTypes: ['stop_contact_on', 'stop_contact_off', 'long_stop'],
  },
  {
    id: 'temperature',
    label: 'Température',
    alertTypes: ['temperature_alert', 'engine_temperature'],
  },
  {
    id: 'contact_doors',
    label: 'Contact et portes',
    alertTypes: ['contact_on_off', 'door'],
  },
  {
    id: 'driving',
    label: 'Conduite',
    alertTypes: [
      'speeding',
      'excessive_idle',
      'driving_time_exceeded',
      'harsh_brake',
      'harsh_accel',
      'engine_overspeed',
      'hard_deceleration',
      'harsh_turn',
    ],
  },
  {
    id: 'emergency',
    label: 'Urgence',
    alertTypes: ['sos'],
  },
];

export function getSecurityAlertTypes(): AlertType[] {
  return SECURITY_ALERT_GROUPS.flatMap((g) => g.alertTypes);
}

/** Security center section — excludes driving behaviour types */
export function getSecurityOnlyAlertTypes(): AlertType[] {
  return SECURITY_ALERT_GROUPS.filter((g) => g.id !== 'driving').flatMap((g) => g.alertTypes);
}

export function getSecurityAlertGroup(alertType: AlertType): SecurityAlertGroup | undefined {
  return SECURITY_ALERT_GROUPS.find((g) => g.alertTypes.includes(alertType));
}

export function isExcludedSecurityAlertType(alertType: AlertType): boolean {
  return EXCLUDED_SECURITY_ALERT_TYPES.includes(alertType);
}
