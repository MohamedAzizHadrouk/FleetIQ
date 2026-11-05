import { AlertCircle, AlertTriangle, Info, type LucideIcon } from 'lucide-react';
import type { AlertPriority, AlertSeverity } from '@/types/alerts';

export interface SeverityConfig {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  badgeVariant: 'critical' | 'high' | 'medium' | 'info';
  dotColor: string;
}

export const SEVERITY_CONFIG: Record<AlertSeverity, SeverityConfig> = {
  critical: {
    label: 'Critique',
    icon: AlertCircle,
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    iconColor: 'text-rose-600',
    badgeVariant: 'critical',
    dotColor: 'bg-rose-500',
  },
  warning: {
    label: 'Avertissement',
    icon: AlertTriangle,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconColor: 'text-amber-600',
    badgeVariant: 'medium',
    dotColor: 'bg-severity-medium',
  },
  info: {
    label: 'Information',
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-600',
    badgeVariant: 'info',
    dotColor: 'bg-severity-info',
  },
};

export const PRIORITY_CONFIG: Record<AlertPriority, SeverityConfig> = {
  critical: SEVERITY_CONFIG.critical,
  high: {
    label: 'Élevée',
    icon: AlertTriangle,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    iconColor: 'text-orange-600',
    badgeVariant: 'high',
    dotColor: 'bg-orange-500',
  },
  medium: SEVERITY_CONFIG.warning,
  low: SEVERITY_CONFIG.info,
};

export function getSeverityConfig(severity: AlertSeverity): SeverityConfig {
  return SEVERITY_CONFIG[severity];
}

export function getPriorityConfig(priority: AlertPriority): SeverityConfig {
  return PRIORITY_CONFIG[priority];
}
