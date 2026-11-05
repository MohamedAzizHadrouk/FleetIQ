import { CheckCircle2, Clock, MapPin } from 'lucide-react';
import type { FleetAlert } from '@/types/alerts';
import { getPriorityConfig } from '@/design-system/severity';
import { cn } from '@/lib/utils';
import { AlertEmptyState } from '../states/AlertEmptyState';
import { AlertFeedSkeleton } from '../states/AlertFeedSkeleton';
import { AlertErrorState } from '../states/AlertErrorState';
import { AlertTypeIcon } from '../shared/AlertTypeIcon';

interface SimpleAlertListProps {
  alerts?: FleetAlert[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onResolve: (id: string) => void;
  onOpenMap?: (vehicleId: string, coords: [number, number]) => void;
}

export function SimpleAlertList({
  alerts,
  isLoading,
  isError,
  onRetry,
  onResolve,
  onOpenMap,
}: SimpleAlertListProps) {
  if (isLoading) return <AlertFeedSkeleton />;
  if (isError) return <AlertErrorState onRetry={onRetry} />;
  if (!alerts?.length) return <AlertEmptyState />;

  return (
    <div className="space-y-3 p-6">
      {alerts.map((alert) => {
        const config = getPriorityConfig(alert.priority);

        return (
          <div
            key={alert.id}
            className={cn(
              'rounded-xl border p-4 transition-shadow',
              config.bgColor,
              config.borderColor,
              !alert.isRead ? 'shadow-sm' : 'opacity-80'
            )}
          >
            <div className="flex items-start gap-4">
              <AlertTypeIcon alertType={alert.type} severity={alert.severity} />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {alert.vehicleName}
                      </h3>
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                      )}
                      <span className="text-xs text-slate-500 shrink-0">{config.label}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{alert.message}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                      {alert.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{alert.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {alert.status !== 'resolved' && (
                      <button
                        type="button"
                        onClick={() => onResolve(alert.id)}
                        className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                        title="Résoudre"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </button>
                    )}
                    {alert.coordinates && onOpenMap && (
                      <button
                        type="button"
                        onClick={() => onOpenMap(alert.vehicleId, alert.coordinates!)}
                        className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                        title="Voir sur la carte"
                      >
                        <MapPin className="w-4 h-4 text-blue-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
