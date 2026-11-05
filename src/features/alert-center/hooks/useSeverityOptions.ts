import type { AlertSeverity } from '@/types/alerts';
import type { CustomSeverityLevel, SeverityOption } from '@/types/alert-config';
import { SEVERITY_CONFIG } from '@/design-system/severity';
import {
  useBuiltinSeverityOverrides,
  useCustomSeverities,
} from '../hooks/useAlertQueries';

const BUILTIN_SEVERITIES: AlertSeverity[] = ['critical', 'warning', 'info'];

export function useSeverityOptions(): {
  options: SeverityOption[];
  isLoading: boolean;
} {
  const { data: custom = [], isLoading: customLoading } = useCustomSeverities();
  const { data: overrides = [], isLoading: overridesLoading } = useBuiltinSeverityOverrides();

  const options: SeverityOption[] = [
    ...BUILTIN_SEVERITIES.map((severity) => {
      const override = overrides.find((o) => o.severity === severity);
      const config = SEVERITY_CONFIG[severity];
      return {
        id: severity,
        label: override?.label ?? config.label,
        color: override?.color ?? defaultBuiltinColor(severity),
        isCustom: false,
      };
    }),
    ...[...custom]
      .sort((a, b) => a.order - b.order)
      .map((level) => ({
        id: level.id,
        label: level.label,
        color: level.color,
        isCustom: true,
      })),
  ];

  return { options, isLoading: customLoading || overridesLoading };
}

export function buildSeverityOptionsFromLocal(
  overrides: { severity: AlertSeverity; label?: string; color?: string }[],
  customLevels: CustomSeverityLevel[]
): SeverityOption[] {
  return [
    ...BUILTIN_SEVERITIES.map((severity) => {
      const override = overrides.find((o) => o.severity === severity);
      const config = SEVERITY_CONFIG[severity];
      return {
        id: severity,
        label: override?.label ?? config.label,
        color: override?.color ?? defaultBuiltinColor(severity),
        isCustom: false,
      };
    }),
    ...[...customLevels]
      .sort((a, b) => a.order - b.order)
      .map((level) => ({
        id: level.id,
        label: level.label,
        color: level.color,
        isCustom: true,
      })),
  ];
}

function defaultBuiltinColor(severity: AlertSeverity): string {
  if (severity === 'critical') return '#e11d48';
  if (severity === 'warning') return '#d97706';
  return '#2563eb';
}

export function getSeverityLabel(
  severityId: string,
  options: SeverityOption[]
): string {
  return options.find((o) => o.id === severityId)?.label ?? severityId;
}

export { BUILTIN_SEVERITIES };
