import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getSeverityConfig } from '@/design-system/severity';
import { getAlertTypeIconConfigWithFallback } from '@/design-system/alert-type-icons';
import type { AlertSeverity, AlertType } from '@/types/alerts';
import { cn } from '@/lib/utils';

interface AlertTypeIconProps {
  alertType: AlertType;
  severity: AlertSeverity;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const SIZE_CLASSES = {
  sm: { wrapper: 'p-1', icon: 'w-3.5 h-3.5' },
  md: { wrapper: 'p-2', icon: 'w-5 h-5' },
  lg: { wrapper: 'p-2.5', icon: 'w-6 h-6' },
};

export function AlertTypeIcon({
  alertType,
  severity,
  size = 'md',
  showTooltip = true,
  className,
}: AlertTypeIconProps) {
  const config = getAlertTypeIconConfigWithFallback(alertType, severity);
  const severityConfig = getSeverityConfig(severity);
  const Icon = config.icon;
  const sizeClass = SIZE_CLASSES[size];

  const iconNode = (
    <div
      className={cn(
        'rounded-lg shrink-0 flex items-center justify-center',
        sizeClass.wrapper,
        severityConfig.bgColor,
        className
      )}
    >
      <Icon className={cn(sizeClass.icon, severityConfig.iconColor)} />
    </div>
  );

  if (!showTooltip) return iconNode;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{iconNode}</TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        <p className="font-medium">{config.label}</p>
        <p className="text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
