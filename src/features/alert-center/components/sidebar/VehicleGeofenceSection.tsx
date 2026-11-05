import type { GeofenceAlertRule } from '@/types/alert-config';
import type { TimelineEvent } from '@/types/alerts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EventTimeline } from '../timeline/EventTimeline';
import { MapPin } from 'lucide-react';

const EVENT_LABELS: Record<GeofenceAlertRule['eventType'], string> = {
  entry: 'Entrée',
  exit: 'Sortie',
  both: 'Entrée / Sortie',
};

interface VehicleGeofenceSectionProps {
  rules?: GeofenceAlertRule[];
  geofenceHistory?: TimelineEvent[];
  isLoadingRules?: boolean;
  isLoadingHistory?: boolean;
}

export function VehicleGeofenceSection({
  rules,
  geofenceHistory,
  isLoadingRules,
  isLoadingHistory,
}: VehicleGeofenceSectionProps) {
  return (
    <div className="px-4 pb-4 space-y-4">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Règles actives</p>
        {isLoadingRules ? (
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : !rules?.length ? (
          <p className="text-sm text-muted-foreground">Aucune alerte geofencing activée</p>
        ) : (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50/80"
              >
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800">{rule.name}</p>
                  <p className="text-xs text-muted-foreground">{rule.zoneLabel}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <Badge variant="outline" className="text-[10px] h-5">
                      {EVENT_LABELS[rule.eventType]}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Historique geofencing</p>
        <EventTimeline events={geofenceHistory} isLoading={isLoadingHistory} initialLimit={3} />
      </div>
    </div>
  );
}
