import type { SeverityNotificationPolicy } from '@/types/alert-config';

export const INITIAL_SEVERITY_POLICIES: SeverityNotificationPolicy[] = [
  {
    severity: 'critical',
    roles: ['administrator', 'fleet_manager', 'driver'],
    userIds: ['user-1', 'user-2'],
    channels: ['sms', 'email', 'push'],
  },
  {
    severity: 'warning',
    roles: ['fleet_manager', 'driver'],
    userIds: ['user-2'],
    channels: ['email', 'push'],
  },
  {
    severity: 'info',
    roles: ['fleet_manager'],
    userIds: [],
    channels: ['email'],
  },
];
