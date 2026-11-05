import { useState } from 'react';
import { Wrench, AlertTriangle, ChevronDown } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { FleetOverviewData } from '@/types/alerts';
import {
  FLEET_OFFLINE_DEFINITION,
  FLEET_ONLINE_DEFINITION,
} from '@/design-system/vehicle-status-definitions';
import { cn } from '@/lib/utils';
import { FleetStatusLabelWithTooltip } from '../shared/FleetStatusLabelWithTooltip';
import {
  FleetStatusListDialog,
  type FleetStatusDialogVariant,
} from './FleetStatusListDialog';
import { RecentAlertsTimelineSection } from './RecentAlertsTimelineSection';

const MAINTENANCE_INITIAL_LIMIT = 3;

interface FleetOverviewPanelProps {
  vehicles: Vehicle[];
  data?: FleetOverviewData;
  isLoading?: boolean;
  onVehicleClick?: (vehicleId: string) => void;
}

export function FleetOverviewPanel({
  vehicles,
  data,
  isLoading,
  onVehicleClick,
}: FleetOverviewPanelProps) {
  const [dialogVariant, setDialogVariant] = useState<FleetStatusDialogVariant | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [maintenanceExpanded, setMaintenanceExpanded] = useState(false);

  const openDialog = (variant: FleetStatusDialogVariant) => {
    setDialogVariant(variant);
    setDialogOpen(true);
  };

  const dialogVehicles =
    dialogVariant === 'online'
      ? data?.onlineVehicles ?? []
      : dialogVariant === 'offline'
        ? data?.offlineVehicles ?? []
        : data?.sosVehicles ?? [];

  const maintenanceItems = data?.upcomingMaintenance ?? [];
  const canExpandMaintenance = maintenanceItems.length > MAINTENANCE_INITIAL_LIMIT;
  const visibleMaintenance = maintenanceExpanded || !canExpandMaintenance
    ? maintenanceItems
    : maintenanceItems.slice(0, MAINTENANCE_INITIAL_LIMIT);
  const hiddenMaintenanceCount = canExpandMaintenance
    ? maintenanceItems.length - MAINTENANCE_INITIAL_LIMIT
    : 0;

  if (isLoading || !data) {
    return (
      <div className="p-4 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-4 space-y-4 h-full overflow-y-auto scrollbar-hide">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Flotte en direct</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <FleetStatusLabelWithTooltip
              definition={FLEET_ONLINE_DEFINITION}
              count={data.vehiclesOnline}
              countClassName="text-emerald-600"
              onClick={() => openDialog('online')}
            />
            <div className="w-px bg-border" />
            <FleetStatusLabelWithTooltip
              definition={FLEET_OFFLINE_DEFINITION}
              count={data.vehiclesOffline}
              countClassName="text-slate-500"
              onClick={() => openDialog('offline')}
            />
          </CardContent>
        </Card>

        <button
          type="button"
          onClick={() => openDialog('sos')}
          className={cn(
            'w-full text-left rounded-xl border transition-colors',
            data.activeSosCount > 0
              ? 'border-rose-200 bg-rose-50 hover:bg-rose-100/80'
              : 'border-slate-200 bg-white hover:bg-slate-50'
          )}
        >
          <div className="p-4 flex items-center gap-3">
            <div
              className={cn(
                'p-2 rounded-lg',
                data.activeSosCount > 0 ? 'bg-rose-600 animate-pulse-critical' : 'bg-slate-200'
              )}
            >
              <AlertTriangle
                className={cn('w-5 h-5', data.activeSosCount > 0 ? 'text-white' : 'text-slate-500')}
              />
            </div>
            <div>
              <p
                className={cn(
                  'font-bold',
                  data.activeSosCount > 0 ? 'text-rose-700' : 'text-slate-700'
                )}
              >
                {data.activeSosCount} SOS actif(s)
              </p>
              <p className="text-xs text-muted-foreground">
                {data.activeSosCount > 0
                  ? 'Intervention immédiate requise — cliquer pour la liste'
                  : 'Aucun SOS actif — cliquer pour voir la liste'}
              </p>
            </div>
          </div>
        </button>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4" /> Maintenance à venir
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleMaintenance.map((m) => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="font-medium">{m.vehicleName}</span>
                <span className="text-muted-foreground">{m.type} · {m.dueIn}</span>
              </div>
            ))}
            {canExpandMaintenance && (
              <div className="flex justify-center pt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMaintenanceExpanded((v) => !v)}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <ChevronDown
                    className={cn(
                      'w-3.5 h-3.5 mr-1 transition-transform',
                      maintenanceExpanded && 'rotate-180'
                    )}
                  />
                  {maintenanceExpanded ? 'Voir moins' : `Voir plus (${hiddenMaintenanceCount})`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <RecentAlertsTimelineSection vehicles={vehicles} onVehicleClick={onVehicleClick} />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Véhicules à risque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topRiskVehicles.map((v) => (
              <button
                key={v.vehicleId}
                className="w-full flex items-center justify-between text-sm p-2 rounded-lg hover:bg-slate-50 transition-colors text-left"
                onClick={() => onVehicleClick?.(v.vehicleId)}
              >
                <span className="font-medium truncate">{v.vehicleName}</span>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5 shrink-0 ml-2">
                  {v.criticalCount + v.warningCount + v.infoCount}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <FleetStatusListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={dialogVariant}
        vehicles={dialogVehicles}
        onSelectVehicle={(id) => onVehicleClick?.(id)}
      />
    </>
  );
}
