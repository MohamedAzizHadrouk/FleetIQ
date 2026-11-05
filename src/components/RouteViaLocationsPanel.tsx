import type { LatLng, LocationOverlay, OverlayFormDraft } from '@/types/map-overlays';
import { MapSidePanel } from '@/components/MapSidePanel';
import { RouteViaLocationsForm } from '@/components/RouteViaLocationsForm';
import { ArrowLeft, Route } from 'lucide-react';

interface RouteViaLocationsPanelProps {
  open: boolean;
  locations: LocationOverlay[];
  onClose: () => void;
  onSave: (draft: OverlayFormDraft) => void;
  onRequestAddLocation: () => void;
  onPreviewChange?: (
    geometry: LatLng[],
    metrics: { distanceMeters: number; durationSeconds: number } | null,
    waypoints?: LatLng[]
  ) => void;
}

/** @deprecated Use RouteCreatePanel instead */
export function RouteViaLocationsPanel({
  open,
  locations,
  onClose,
  onSave,
  onRequestAddLocation,
  onPreviewChange,
}: RouteViaLocationsPanelProps) {
  if (!open) return null;

  return (
    <MapSidePanel>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-sky-50 text-sky-600">
          <Route className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1 truncate">
          Route par emplacements
        </h2>
      </div>

      <RouteViaLocationsForm
        active={open}
        locations={locations}
        onSave={onSave}
        onCancel={onClose}
        onRequestAddLocation={onRequestAddLocation}
        onPreviewChange={onPreviewChange}
      />
    </MapSidePanel>
  );
}
