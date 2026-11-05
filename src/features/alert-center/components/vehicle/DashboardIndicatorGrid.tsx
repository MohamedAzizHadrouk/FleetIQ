import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CARD_DASHBOARD_INDICATORS, INDICATOR_SEVERITY_COLORS } from '@/design-system/dashboard-indicators';
import type { DashboardIndicatorState } from '@/types/alerts';
import { cn } from '@/lib/utils';

interface DashboardIndicatorGridProps {
  indicators: Record<string, DashboardIndicatorState>;
  columns?: number;
  size?: 'sm' | 'md';
}

export function DashboardIndicatorGrid({
  indicators,
  columns = 10,
  size = 'sm',
}: DashboardIndicatorGridProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';
  const cellPadding = size === 'sm' ? 'p-1' : 'p-1.5';
  const gap = size === 'sm' ? 'gap-1' : 'gap-2';

  return (
    <div
      className={cn('grid', gap)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {CARD_DASHBOARD_INDICATORS.map((config) => {
        const state = indicators[config.id];
        const isActive = state?.status === 'active';
        const Icon = config.icon;
        const colorClass = isActive
          ? INDICATOR_SEVERITY_COLORS[state?.severity ?? 'warning']
          : INDICATOR_SEVERITY_COLORS.inactive;

        return (
          <Tooltip key={config.id}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'flex items-center justify-center rounded-md transition-colors',
                  cellPadding,
                  isActive ? 'bg-slate-100' : 'bg-transparent'
                )}
              >
                <Icon className={cn(iconSize, colorClass, isActive && 'drop-shadow-sm')} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium">{config.label}</p>
              <p className="text-muted-foreground">
                {isActive ? `Actif — ${state?.severity ?? 'alerte'}` : 'Inactif'}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
