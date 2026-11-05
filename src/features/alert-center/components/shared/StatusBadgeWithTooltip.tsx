import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  getGpsStatusDefinition,
  getVehicleStatusDefinition,
} from '@/design-system/vehicle-status-definitions';
import type { VehicleStatus } from '@/types';
import type { GpsFilterStatus } from '@/types/alerts';
import { cn } from '@/lib/utils';

type StatusBadgeWithTooltipProps =
  | {
      kind: 'vehicle';
      value: VehicleStatus;
      className?: string;
    }
  | {
      kind: 'gps';
      value: GpsFilterStatus;
      className?: string;
    };

export function StatusBadgeWithTooltip(props: StatusBadgeWithTooltipProps) {
  const config =
    props.kind === 'vehicle'
      ? getVehicleStatusDefinition(props.value)
      : getGpsStatusDefinition(props.value);
  const Icon = config.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant={config.badgeVariant}
          className={cn('text-[10px] h-5 gap-1 cursor-default', props.className)}
        >
          <Icon className="w-3 h-3 shrink-0" />
          {config.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs max-w-[220px]">
        <p className="font-medium">{config.label}</p>
        <p className="text-muted-foreground">{config.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
