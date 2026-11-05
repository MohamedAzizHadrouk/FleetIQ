import { useEffect, useState } from 'react';
import type {
  DefaultZoneOverlay,
  OverlayFormDraft,
  PolygonOverlay,
  RouteOverlay,
} from '@/types/map-overlays';
import {
  defaultGeoVisibility,
  emptyAssignment,
  formatRouteDistance,
  formatRouteDuration,
} from '@/types/map-overlays';
import {
  GeoVisibilityFields,
  validateGeoVisibility,
} from '@/components/GeoVisibilityFields';
import { MapSidePanel } from '@/components/MapSidePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Landmark, Pencil, Pentagon, Route } from 'lucide-react';

type EditKind = 'polygon' | 'route' | 'defaultZone';

const KIND_VISUAL: Record<
  EditKind,
  { icon: typeof Pentagon; chip: string }
> = {
  polygon: { icon: Pentagon, chip: 'bg-violet-50 text-violet-600' },
  route: { icon: Route, chip: 'bg-sky-50 text-sky-600' },
  defaultZone: { icon: Landmark, chip: 'bg-amber-50 text-amber-600' },
};

interface OverlayAssignModalProps {
  open: boolean;
  kind: EditKind | null;
  title: string;
  draft: OverlayFormDraft | null;
  nameEditable?: boolean;
  /** Show map-geometry edit hint */
  geometryEditable?: boolean;
  readOnly?: boolean;
  onStartEdit?: () => void;
  onChange: (next: OverlayFormDraft) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function draftFromPolygon(p: PolygonOverlay): OverlayFormDraft {
  return {
    name: p.name,
    assignment: p.assignment ?? emptyAssignment(),
    alertType: p.alertType ?? 'les_deux',
    visibility: p.visibility ?? defaultGeoVisibility(),
    points: p.points,
  };
}

export function draftFromRoute(r: RouteOverlay): OverlayFormDraft {
  return {
    name: r.name,
    assignment: r.assignment ?? emptyAssignment(),
    alertType: r.alertType ?? 'les_deux',
    visibility: r.visibility ?? defaultGeoVisibility(),
    points: r.points,
    waypoints: r.waypoints,
    waypointLocationIds: r.waypointLocationIds,
    distanceMeters: r.distanceMeters,
    durationSeconds: r.durationSeconds,
  };
}

export function draftFromDefaultZone(z: DefaultZoneOverlay): OverlayFormDraft {
  return {
    name: z.name,
    assignment: z.assignment ?? emptyAssignment(),
    alertType: z.alertType ?? 'les_deux',
    visibility: defaultGeoVisibility(),
    points: z.points,
  };
}

export function OverlayAssignModal({
  open,
  kind,
  title,
  draft,
  nameEditable = true,
  geometryEditable = false,
  readOnly = false,
  onStartEdit,
  onChange,
  onSave,
  onCancel,
}: OverlayAssignModalProps) {
  const [errors, setErrors] = useState<{ name?: string; visibility?: string }>(
    {}
  );

  useEffect(() => {
    if (open) setErrors({});
  }, [open]);

  if (!open || !draft || !kind) return null;

  const visual = KIND_VISUAL[kind];
  const KindIcon = visual.icon;
  const displayTitle =
    readOnly && (title.startsWith('Modifier') || title.startsWith('Affecter'))
      ? kind === 'defaultZone'
        ? 'Détails de la zone province'
        : kind === 'polygon'
          ? 'Détails du polygone'
          : 'Détails de la route'
      : title;

  const update = <K extends keyof OverlayFormDraft>(
    key: K,
    value: OverlayFormDraft[K]
  ) => {
    onChange({ ...draft, [key]: value });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (nameEditable && !draft.name.trim()) next.name = 'Le nom est requis.';
    if (kind !== 'defaultZone') {
      const visibilityError = validateGeoVisibility(
        draft.visibility ?? defaultGeoVisibility()
      );
      if (visibilityError) next.visibility = visibilityError;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    onSave();
  };

  return (
    <MapSidePanel
      role="dialog"
      aria-modal="false"
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
        <span
          className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${visual.chip}`}
        >
          <KindIcon className="w-4 h-4" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800 flex-1 truncate">
          {displayTitle}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!readOnly &&
          geometryEditable &&
          (kind === 'polygon' || kind === 'route') && (
            <p className="text-xs text-slate-500 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
              Modifiez les points directement sur la carte (glisser, ajouter,
              Backspace pour annuler le dernier). Puis enregistrez ici.
            </p>
          )}

        {nameEditable ? (
          <div className="space-y-1.5">
            <Label htmlFor="ov-name">Nom</Label>
            <Input
              id="ov-name"
              value={draft.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Saisir un nom…"
              disabled={readOnly}
            />
            {errors.name && (
              <p className="text-xs text-rose-600">{errors.name}</p>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-800">{draft.name}</p>
        )}

        {kind === 'route' &&
          (draft.distanceMeters != null || draft.durationSeconds != null) && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              Trajet estimé :{' '}
              <span className="font-medium text-slate-700">
                {formatRouteDistance(draft.distanceMeters)} ·{' '}
                {formatRouteDuration(draft.durationSeconds)}
              </span>
            </p>
          )}

        {kind !== 'defaultZone' && (
          <GeoVisibilityFields
            visibility={draft.visibility ?? defaultGeoVisibility()}
            onChange={(visibility) => update('visibility', visibility)}
            error={errors.visibility}
            disabled={readOnly}
          />
        )}
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
