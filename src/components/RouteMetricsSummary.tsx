import { formatRouteDistance, formatRouteDuration } from '@/types/map-overlays';
import { cn } from '@/lib/utils';
import { Clock, Route } from 'lucide-react';

interface RouteMetricsSummaryProps {
  distanceMeters?: number;
  durationSeconds?: number;
  loading?: boolean;
  className?: string;
}

function MetricCell({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Route;
  label: string;
  value: string;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-2 py-1">
      <span className="h-7 w-7 rounded-lg bg-sky-100 text-sky-600 inline-flex items-center justify-center">
        <Icon className="w-3.5 h-3.5" />
      </span>
      <span className="text-[10px] text-slate-500">{label}</span>
      {loading ? (
        <span className="h-6 w-20 rounded-md bg-sky-100/80 animate-pulse" />
      ) : (
        <span className="text-lg font-bold text-slate-900 tabular-nums leading-tight">
          {value}
        </span>
      )}
    </div>
  );
}

export function RouteMetricsSummary({
  distanceMeters,
  durationSeconds,
  loading = false,
  className,
}: RouteMetricsSummaryProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white shadow-sm p-3',
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700/80 mb-2">
        {loading ? 'Calcul du trajet…' : 'Estimation du trajet'}
      </p>
      <div className="grid grid-cols-2 divide-x divide-sky-100">
        <MetricCell
          icon={Route}
          label="Distance"
          value={formatRouteDistance(distanceMeters)}
          loading={loading}
        />
        <MetricCell
          icon={Clock}
          label="Durée"
          value={formatRouteDuration(durationSeconds)}
          loading={loading}
        />
      </div>
    </div>
  );
}
