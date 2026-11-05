import type {
  LatLng,
  LocationOverlay,
  OverlayFormDraft,
} from '@/types/map-overlays';
import type { RouteCreateMode } from '@/hooks/useMapOverlays';
import { useRouteMetrics } from '@/hooks/useRouteMetrics';
import { MapSidePanel } from '@/components/MapSidePanel';
import { RouteMetricsSummary } from '@/components/RouteMetricsSummary';
import { RouteViaLocationsForm } from '@/components/RouteViaLocationsForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, MapPinned, Route, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteCreatePanelProps {
  open: boolean;
  mode: RouteCreateMode;
  locations: LocationOverlay[];
  pendingPoints: LatLng[];
  onModeChange: (mode: RouteCreateMode) => void;
  onClose: () => void;
  onFinishMapRoute: () => void | Promise<void>;
  onUndoPoint: () => void;
  onSave: (draft: OverlayFormDraft) => void;
  onRequestAddLocation: () => void;
  mapPointToAdd?: LatLng | null;
  onMapPointConsumed?: () => void;
  onPreviewChange?: (
    geometry: LatLng[],
    metrics: { distanceMeters: number; durationSeconds: number } | null,
    waypoints?: LatLng[]
  ) => void;
}

function ModeCard({
  icon: Icon,
  chip,
  title,
  description,
  onClick,
}: {
  icon: typeof Route;
  chip: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-sky-300 hover:bg-sky-50/30 transition-colors shadow-sm"
    >
      <span
        className={cn(
          'h-10 w-10 rounded-lg inline-flex items-center justify-center mb-3',
          chip
        )}
      >
        <Icon className="w-5 h-5" />
      </span>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
    </button>
  );
}

export function RouteCreatePanel({
  open,
  mode,
  locations,
  pendingPoints,
  onModeChange,
  onClose,
  onFinishMapRoute,
  onUndoPoint,
  onSave,
  onRequestAddLocation,
  mapPointToAdd = null,
  onMapPointConsumed,
  onPreviewChange,
}: RouteCreatePanelProps) {
  const { metrics, routing } = useRouteMetrics(
    pendingPoints,
    open && mode === 'map'
  );

  if (!open) return null;

  const handleBack = () => {
    onModeChange(null);
  };

  const title =
    mode === null
      ? 'Ajouter un itinéraire'
      : mode === 'locations'
        ? 'À partir d\'emplacements'
        : 'Points sur la carte';

  return (
    <MapSidePanel>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={mode === null ? onClose : handleBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title={mode === null ? 'Fermer' : 'Retour au choix'}
          aria-label={mode === null ? 'Fermer' : 'Retour au choix'}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-sky-50 text-sky-600">
          <Route className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1 truncate">
          {title}
        </h2>
      </div>

      {mode === null && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-slate-600">
            Choisissez comment construire votre itinéraire.
          </p>
          <ModeCard
            icon={MapPinned}
            chip="bg-emerald-50 text-emerald-600"
            title="À partir d'emplacements"
            description="Sélectionnez des emplacements enregistrés comme étapes du trajet."
            onClick={() => onModeChange('locations')}
          />
          <ModeCard
            icon={MapPin}
            chip="bg-sky-50 text-sky-600"
            title="Points sur la carte"
            description="Placez librement des points sur la carte pour tracer l'itinéraire."
            onClick={() => onModeChange('map')}
          />
        </div>
      )}

      {mode === 'locations' && (
        <RouteViaLocationsForm
          active
          locations={locations}
          onSave={onSave}
          onCancel={onClose}
          onRequestAddLocation={onRequestAddLocation}
          mapPointToAdd={mapPointToAdd}
          onMapPointConsumed={onMapPointConsumed}
          onPreviewChange={onPreviewChange}
        />
      )}

      {mode === 'map' && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {(routing || metrics) && pendingPoints.length >= 2 && (
              <RouteMetricsSummary
                distanceMeters={metrics?.distanceMeters}
                durationSeconds={metrics?.durationSeconds}
                loading={routing}
              />
            )}

            <p className="text-sm text-slate-600 leading-relaxed">
              Cliquez sur la carte pour ajouter des points. Minimum 2 points
              pour créer l&apos;itinéraire.
            </p>

            <div className="rounded-lg border border-sky-100 bg-sky-50/50 px-3 py-2">
              <p className="text-xs font-medium text-sky-800">
                {pendingPoints.length} point
                {pendingPoints.length !== 1 ? 's' : ''} placé
                {pendingPoints.length !== 1 ? 's' : ''}
              </p>
            </div>

            {pendingPoints.length > 0 ? (
              <ul className="space-y-1.5">
                {pendingPoints.map((point, index) => (
                  <li
                    key={`${point[0]}-${point[1]}-${index}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm"
                  >
                    <span className="h-6 w-6 rounded-full bg-sky-600 text-white text-xs font-bold inline-flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 font-mono text-xs truncate">
                      {point[0].toFixed(5)}, {point[1].toFixed(5)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4 border border-dashed border-slate-200 rounded-lg">
                Aucun point — cliquez sur la carte pour commencer.
              </p>
            )}

            {pendingPoints.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={onUndoPoint}
              >
                <Undo2 className="w-4 h-4" />
                Supprimer le dernier point
              </Button>
            )}

          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={pendingPoints.length < 2}
              onClick={() => void onFinishMapRoute()}
            >
              Terminer
            </Button>
          </div>
        </>
      )}
    </MapSidePanel>
  );
}
