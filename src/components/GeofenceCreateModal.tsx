import { useEffect, useState } from 'react';
import type { GeofenceDraft, LatLng } from '@/types/map-overlays';
import { defaultGeoVisibility } from '@/types/map-overlays';
import {
  GeoVisibilityFields,
  validateGeoVisibility,
} from '@/components/GeoVisibilityFields';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CircleDot, Pencil } from 'lucide-react';
import { MapSidePanel } from '@/components/MapSidePanel';
import { getTunisiaProvince } from '@/data/tunisia-provinces';

interface GeofenceCreateModalProps {
  open: boolean;
  draft: GeofenceDraft | null;
  onDraftChange: (draft: GeofenceDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  title?: string;
  onFlyTo?: (center: LatLng, zoom?: number) => void;
  readOnly?: boolean;
  onStartEdit?: () => void;
  onBeforeGeometryChange?: () => void;
}

/**
 * Left sidebar form so the user can re-click the map to reposition the
 * geofence while the form stays open.
 */
export function GeofenceCreateModal({
  open,
  draft,
  onDraftChange,
  onSave,
  onCancel,
  title = 'Ajouter un géopérage',
  onFlyTo,
  readOnly = false,
  onStartEdit,
  onBeforeGeometryChange,
}: GeofenceCreateModalProps) {
  const [errors, setErrors] = useState<{
    name?: string;
    radiusKm?: string;
    visibility?: string;
  }>({});

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  if (!open || !draft) return null;

  const isLegacyGouvernorat = draft.shapeType === 'gouvernorat';
  const legacyProvince = draft.provinceId
    ? getTunisiaProvince(draft.provinceId)
    : undefined;
  const displayTitle =
    readOnly && title.startsWith('Modifier')
      ? 'Détails du géopérage'
      : title;

  const update = <K extends keyof GeofenceDraft>(
    key: K,
    value: GeofenceDraft[K]
  ) => {
    if (
      key === 'center' ||
      key === 'radiusKm' ||
      key === 'shapeType'
    ) {
      onBeforeGeometryChange?.();
    }
    onDraftChange({ ...draft, [key]: value });
  };

  const handleShapeChange = (shapeType: GeofenceDraft['shapeType']) => {
    onBeforeGeometryChange?.();
    onDraftChange({
      ...draft,
      shapeType,
      provinceId: undefined,
    });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!draft.name.trim()) next.name = 'Le nom est requis.';
    if (!isLegacyGouvernorat && (!draft.radiusKm || draft.radiusKm <= 0)) {
      next.radiusKm = 'Rayon invalide.';
    }
    const visibilityError = validateGeoVisibility(
      draft.visibility ?? defaultGeoVisibility()
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
      aria-labelledby="geofence-modal-title"
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
        <span className="h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
          <CircleDot className="w-4 h-4" />
        </span>
        <h2
          id="geofence-modal-title"
          className="text-sm font-semibold text-slate-800 flex-1 truncate"
        >
          {displayTitle}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!readOnly && !isLegacyGouvernorat && (
          <p className="text-xs text-slate-500">
            Maintenez le clic et glissez pour tracer. Déplacez le point central
            pour repositionner.
          </p>
        )}

        {isLegacyGouvernorat && (
          <p className="text-xs text-slate-500 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            Géopérage existant de type gouvernorat
            {legacyProvince ? ` : ${legacyProvince.name}` : ''}.
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="gf-name">Nom de géopérage</Label>
          <Input
            id="gf-name"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            placeholder="Ex: Zone dépôt"
            disabled={readOnly}
          />
          {errors.name && (
            <p className="text-xs text-rose-600">{errors.name}</p>
          )}
        </div>

        {!isLegacyGouvernorat && (
          <div className="space-y-1.5">
            <Label htmlFor="gf-shape">Type de géopérage</Label>
            <select
              id="gf-shape"
              value={draft.shapeType}
              onChange={(e) =>
                handleShapeChange(
                  e.target.value as GeofenceDraft['shapeType']
                )
              }
              disabled={readOnly}
              className="w-full h-9 rounded-md border border-slate-200 px-2 text-sm bg-white disabled:bg-slate-50 disabled:text-slate-600"
            >
              <option value="circulaire">Circulaire</option>
              <option value="rectangulaire">Rectangulaire</option>
            </select>
          </div>
        )}

        {!isLegacyGouvernorat && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="gf-radius">Rayon (km)</Label>
              <Input
                id="gf-radius"
                type="number"
                min={0.1}
                step={0.1}
                value={draft.radiusKm}
                onChange={(e) =>
                  update('radiusKm', parseFloat(e.target.value) || 0)
                }
                disabled={readOnly}
              />
              {errors.radiusKm && (
                <p className="text-xs text-rose-600">{errors.radiusKm}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="gf-lat">Latitude</Label>
                <Input
                  id="gf-lat"
                  type="number"
                  step="any"
                  value={Number(draft.center[0].toFixed(6))}
                  onChange={(e) =>
                    update('center', [
                      parseFloat(e.target.value) || 0,
                      draft.center[1],
                    ])
                  }
                  disabled={readOnly}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gf-lng">Longitude</Label>
                <Input
                  id="gf-lng"
                  type="number"
                  step="any"
                  value={Number(draft.center[1].toFixed(6))}
                  onChange={(e) =>
                    update('center', [
                      draft.center[0],
                      parseFloat(e.target.value) || 0,
                    ])
                  }
                  disabled={readOnly}
                />
              </div>
            </div>
          </>
        )}

        <GeoVisibilityFields
          visibility={draft.visibility ?? defaultGeoVisibility()}
          onChange={(visibility) => update('visibility', visibility)}
          error={errors.visibility}
          disabled={readOnly}
        />
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex gap-2">
        {readOnly ? (
          <>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Fermer
            </Button>
            <Button
              type="button"
              className="flex-1 gap-1.5"
              onClick={onStartEdit}
            >
              <Pencil className="w-3.5 h-3.5" />
              Modifier
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </MapSidePanel>
  );
}
