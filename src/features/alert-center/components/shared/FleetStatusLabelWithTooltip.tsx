import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { StatusDefinition } from '@/design-system/vehicle-status-definitions';
import { cn } from '@/lib/utils';

interface FleetStatusLabelWithTooltipProps {
  definition: StatusDefinition;
  count: number;
  countClassName?: string;
  onClick?: () => void;
  className?: string;
}

export function FleetStatusLabelWithTooltip({
  definition,
  count,
  countClassName,
  onClick,
  className,
}: FleetStatusLabelWithTooltipProps) {
  const Icon = definition.icon;
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex-1 text-center',
        onClick && 'rounded-lg p-2 -m-2 hover:bg-slate-50 transition-colors cursor-pointer',
        className
      )}
    >
      <p className={cn('text-2xl font-bold', countClassName)}>{count}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <p className="text-xs text-muted-foreground inline-flex items-center justify-center gap-1 mt-0.5">
            <Icon className="w-3.5 h-3.5 shrink-0" />
            {definition.label}
          </p>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-[220px]">
          <p className="font-medium">{definition.label}</p>
          <p className="text-muted-foreground">{definition.description}</p>
          {onClick && (
            <p className="text-muted-foreground mt-1">Cliquer pour voir la liste</p>
          )}
        </TooltipContent>
      </Tooltip>
    </Wrapper>
  );
}
