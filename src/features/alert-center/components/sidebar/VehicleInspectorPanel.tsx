import {
  ArrowLeft,
  Clock,
  Download,
  History,
  MapPin,
  Truck,
  User,
  Radio,
} from 'lucide-react';
import { getVehicleById, exportVehicleTimelineCsv } from '../../api/alert-api';
import {
  useVehicleTimeline,
  useVehicleDocumentAlerts,
  useVehicleGeofenceRules,
} from '../../hooks/useAlertQueries';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { StatusBadgeWithTooltip } from '../shared/StatusBadgeWithTooltip';
import { EventTimeline } from '../timeline/EventTimeline';
import { VehicleDocumentAlertsSection } from './VehicleDocumentAlertsSection';
import { VehicleGeofenceSection } from './VehicleGeofenceSection';
import { filterTimelineEvents } from '../../mocks/mockTimeline';
import { buildVehicleSummaries } from '../../mocks/mockVehicleHealth';
import { getAlertStore } from '../../api/alert-api';

interface VehicleInspectorPanelProps {
  vehicleId: string;
  onBack: () => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenHistory?: () => void;
}

export function VehicleInspectorPanel({
  vehicleId,
  onBack,
  onNavigateToVehicle,
  onOpenHistory,
}: VehicleInspectorPanelProps) {
  const vehicle = getVehicleById(vehicleId);
  const { data: timeline, isLoading: timelineLoading } = useVehicleTimeline(vehicleId);
  const { data: documentAlerts, isLoading: documentsLoading } = useVehicleDocumentAlerts(vehicleId);
  const { data: geofenceRules, isLoading: geofenceRulesLoading } = useVehicleGeofenceRules(vehicleId);

  const generalHistory = timeline ? filterTimelineEvents(timeline, 'general') : undefined;
  const geofenceHistory = timeline ? filterTimelineEvents(timeline, 'geofence') : undefined;

  const summary = vehicle
    ? buildVehicleSummaries([vehicle], getAlertStore()).find((s) => s.vehicleId === vehicleId)
    : undefined;

  const handleExport = () => {
    const csv = exportVehicleTimelineCsv(vehicleId);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alertes-${vehicle?.name ?? vehicleId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!vehicle) {
    return (
      <div className="p-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la flotte
        </Button>
        <p className="text-sm text-muted-foreground mt-4">Véhicule introuvable</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      <div className="shrink-0 p-4 border-b border-slate-200 bg-slate-50/80 dark:bg-slate-800/80 dark:border-slate-700 z-10">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-1" /> Retour à la flotte
        </Button>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-900 truncate">{vehicle.name}</h2>
            <p className="text-xs font-mono text-muted-foreground">{summary?.licensePlate}</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <User className="w-3 h-3" />
              {vehicle.driver}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          <StatusBadgeWithTooltip kind="vehicle" value={vehicle.status} />
          {summary && (
            <StatusBadgeWithTooltip kind="gps" value={summary.gpsStatus} />
          )}
        </div>
        <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {vehicle.lastUpdate}
          </div>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" />
            Dernière communication
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{vehicle.location}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <section className="pt-4 pb-2">
          <h3 className="text-sm font-semibold text-slate-800 px-4 mb-2">Historique des alertes</h3>
          <EventTimeline
            key={`${vehicleId}-general`}
            events={generalHistory}
            isLoading={timelineLoading}
            initialLimit={4}
          />
        </section>

        <Separator className="mx-4" />

        <section className="pt-4 pb-2">
          <h3 className="text-sm font-semibold text-slate-800 px-4 mb-2">Documents à régler</h3>
          <VehicleDocumentAlertsSection alerts={documentAlerts} isLoading={documentsLoading} />
        </section>

        <Separator className="mx-4" />

        <section className="pt-4 pb-2">
          <h3 className="text-sm font-semibold text-slate-800 px-4 mb-2">Geofencing</h3>
          <VehicleGeofenceSection
            rules={geofenceRules}
            geofenceHistory={geofenceHistory}
            isLoadingRules={geofenceRulesLoading}
            isLoadingHistory={timelineLoading}
          />
        </section>
      </div>

      <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Actions rapides</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onOpenHistory}>
            <History className="w-3.5 h-3.5 mr-1" /> Historique
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigateToVehicle?.(vehicleId, vehicle.coordinates)}
          >
            <MapPin className="w-3.5 h-3.5 mr-1" /> Carte live
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-1" /> Exporter
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Truck className="w-3.5 h-3.5 mr-1" /> Détails
          </Button>
        </div>
      </div>
    </div>
  );
}
