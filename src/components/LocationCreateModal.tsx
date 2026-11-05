import { useEffect, useState } from 'react';
import type {
  LocationFormState,
  LocationOverlay,
} from '@/types/map-overlays';
import { defaultGeoVisibility } from '@/types/map-overlays';
import {
  GeoVisibilityFields,
  validateGeoVisibility,
} from '@/components/GeoVisibilityFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPinned } from 'lucide-react';
import { MapSidePanel } from '@/components/MapSidePanel';

export type { LocationFormState };

interface LocationCreateModalProps {
  open: boolean;
  title?: string;
  initial: LocationFormState | null;
  onChange: (next: LocationFormState) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function locationFormFromOverlay(loc: LocationOverlay): LocationFormState {
  return {
    name: loc.name,
    position: loc.position,
    visibility: loc.visibility ?? defaultGeoVisibility(),
  };
}

export function LocationCreateModal({
  open,
  title = 'Ajouter un emplacement',
  initial,
  onChange,
  onSave,
  onCancel,
}: LocationCreateModalProps) {
  const [errors, setErrors] = useState<{ name?: string; visibility?: string }>(
    {}
  );

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  if (!open || !initial) return null;

  const update = <K extends keyof LocationFormState>(
    key: K,
    value: LocationFormState[K]
  ) => {
    onChange({ ...initial, [key]: value });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!initial.name.trim()) next.name = 'La description est requise.';
    const visibilityError = validateGeoVisibility(
      initial.visibility ?? defaultGeoVisibility()
    );
    if (visibilityError) next.visibility = visibilityError;
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave();
  };

  return (
    <MapSidePanel
      role="dialog"
      aria-modal="false"
      aria-labelledby="location-modal-title"
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
          <MapPinned className="w-4 h-4" />
        </span>
        <h2
          id="location-modal-title"
          className="text-sm font-semibold text-slate-800 flex-1 truncate"
        >
          {title}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <p className="text-xs text-slate-500">
          Cliquez à nouveau sur la carte pour repositionner l&apos;emplacement.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="loc-name">Description</Label>
          <Input
            id="loc-name"
            value={initial.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Dépôt Nord"
          />
          {errors.name && (
            <p className="text-xs text-rose-600">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="loc-lat">Latitude</Label>
            <Input
              id="loc-lat"
              type="number"
              step="any"
              value={Number(initial.position[0].toFixed(6))}
              onChange={(e) =>
                update('position', [
                  parseFloat(e.target.value) || 0,
                  initial.position[1],
                ])
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="loc-lng">Longitude</Label>
            <Input
              id="loc-lng"
              type="number"
              step="any"
              value={Number(initial.position[1].toFixed(6))}
              onChange={(e) =>
                update('position', [
                  initial.position[0],
                  parseFloat(e.target.value) || 0,
                ])
              }
            />
          </div>
        </div>

        <GeoVisibilityFields
          visibility={initial.visibility ?? defaultGeoVisibility()}
          onChange={(visibility) => update('visibility', visibility)}
          error={errors.visibility}
        />
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="button" className="flex-1" onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </MapSidePanel>
  );
}
