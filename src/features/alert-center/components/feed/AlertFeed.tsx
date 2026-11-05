import type { FleetAlert, AlertPriority } from '@/types/alerts';
import { getPriorityConfig } from '@/design-system/severity';
import { cn } from '@/lib/utils';
import { AlertCard } from './AlertCard';
import { AlertEmptyState } from '../states/AlertEmptyState';
import { AlertFeedSkeleton } from '../states/AlertFeedSkeleton';
import { AlertErrorState } from '../states/AlertErrorState';

const PRIORITY_ORDER: AlertPriority[] = ['critical', 'high', 'medium', 'low'];

interface AlertFeedProps {
  alerts?: FleetAlert[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onResolve: (id: string) => void;
  onOpenVehicle: (vehicleId: string) => void;
  onOpenMap?: (vehicleId: string, coords: [number, number]) => void;
  onViewTimeline: (vehicleId: string) => void;
  onCreateRule?: () => void;
}

export function AlertFeed({
  alerts,
  isLoading,
  isError,
  onRetry,
  onResolve,
  onOpenVehicle,
  onOpenMap,
  onViewTimeline,
  onCreateRule,
}: AlertFeedProps) {
  if (isLoading) return <AlertFeedSkeleton />;
  if (isError) return <AlertErrorState onRetry={onRetry} />;
  if (!alerts?.length) return <AlertEmptyState onCreateRule={onCreateRule} />;

  const grouped = PRIORITY_ORDER.map((priority) => ({
    priority,
    alerts: alerts.filter((a) => a.priority === priority),
  })).filter((g) => g.alerts.length > 0);

  let cardIndex = 0;

  return (
    <div className="space-y-6 p-4">
      {grouped.map(({ priority, alerts: groupAlerts }) => {
        const config = getPriorityConfig(priority);
        return (
          <section key={priority}>
            <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-2 mb-3 flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', config.dotColor)} />
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                {config.label} ({groupAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {groupAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  index={cardIndex++}
                  onResolve={onResolve}
                  onOpenVehicle={onOpenVehicle}
                  onOpenMap={onOpenMap}
                  onViewTimeline={onViewTimeline}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
