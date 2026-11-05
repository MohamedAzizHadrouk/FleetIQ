import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { HealthIndicatorStatus } from '@/types/alerts';
import { INDICATOR_STATUS_COLORS, INDICATOR_STATUS_RING } from '@/design-system/vehicle-indicators';

interface HealthIndicatorLedProps {
  label: string;
  shortLabel: string;
  status: HealthIndicatorStatus;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { dot: 'w-2 h-2', ring: 'w-5 h-5', text: 'text-[9px]' },
  md: { dot: 'w-2.5 h-2.5', ring: 'w-7 h-7', text: 'text-[10px]' },
  lg: { dot: 'w-3 h-3', ring: 'w-9 h-9', text: 'text-xs' },
};

export function HealthIndicatorLed({
  label,
  shortLabel,
  status,
  showPulse = true,
  size = 'sm',
}: HealthIndicatorLedProps) {
  const s = SIZE_MAP[size];
  const isCritical = status === 'critical';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1" aria-label={`${label}: ${status}`}>
            <div
              className={cn(
                'relative flex items-center justify-center rounded-full ring-2',
                s.ring,
                INDICATOR_STATUS_RING[status]
              )}
            >
              <span
                className={cn(
                  'rounded-full',
                  s.dot,
                  INDICATOR_STATUS_COLORS[status],
                  isCritical && showPulse && 'animate-pulse-critical'
                )}
              />
            </div>
            <span className={cn('font-medium text-slate-500', s.text)}>{shortLabel}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{label}</p>
          <p className="capitalize text-slate-300">{status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
