import { useEffect, useMemo, useState } from 'react';
import type {
  GeofenceAlertType,
  GeoVisibility,
  LatLng,
  LocationOverlay,
  OverlayFormDraft,
} from '@/types/map-overlays';
import { defaultGeoVisibility, emptyAssignment } from '@/types/map-overlays';
import {
  GeoVisibilityFields,
  validateGeoVisibility,
} from '@/components/GeoVisibilityFields';
import { RouteMetricsSummary } from '@/components/RouteMetricsSummary';
import { fetchDrivingRoute } from '@/lib/osrm-routing';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ArrowDown,
  GripVertical,
  MapPin,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaypointStop {
  instanceId: string;
  /** Set when the stop comes from a saved location */
  locationId?: string;
  position: LatLng;
}

function newInstanceId() {
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createLocationStop(
  locationId: string,
  position: LatLng
): WaypointStop {
  return {
    instanceId: newInstanceId(),
    locationId,
    position,
  };
}

function createMapStop(position: LatLng): WaypointStop {
  return {
    instanceId: newInstanceId(),
    position,
  };
}

function formatMapPointLabel(position: LatLng): string {
  return `Point carte (${position[0].toFixed(5)}, ${position[1].toFixed(5)})`;
}

function SortableStopRow({
  stop,
  index,
  total,
  name,
  role,
  onMove,
  onRemove,
}: {
  stop: WaypointStop;
  index: number;
  total: number;
  name: string;
  role: string;
  onMove: (index: number, dir: -1 | 1) => void;
  onRemove: (index: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.instanceId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5',
        isDragging && 'opacity-90 shadow-lg border-blue-200 bg-white z-10 relative'
      )}
    >
      <button
        type="button"
        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none shrink-0"
        title="Glisser pour réordonner"
        aria-label="Glisser pour réordonner"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-slate-400">
          {role}
        </p>
        <p className="text-sm font-medium text-slate-800 truncate">{name}</p>
      </div>
      <button
        type="button"
        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
        disabled={index === 0}
        onClick={() => onMove(index, -1)}
        title="Monter"
      >
        <ArrowDown className="w-3.5 h-3.5 rotate-180" />
      </button>
      <button
        type="button"
        className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
        disabled={index === total - 1}
        onClick={() => onMove(index, 1)}
        title="Descendre"
      >
        <ArrowDown className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        className="p-1 text-rose-500 hover:bg-rose-50 rounded"
        onClick={() => onRemove(index)}
        title="Retirer"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </li>
  );
}

export interface RouteViaLocationsFormProps {
  active: boolean;
  locations: LocationOverlay[];
  onSave: (draft: OverlayFormDraft) => void;
  onCancel: () => void;
  onRequestAddLocation: () => void;
  /** Map click queued by parent while in locations mode */
  mapPointToAdd?: LatLng | null;
  onMapPointConsumed?: () => void;
  onPreviewChange?: (
    geometry: LatLng[],
    metrics: { distanceMeters: number; durationSeconds: number } | null,
    waypoints?: LatLng[]
  ) => void;
}

export function RouteViaLocationsForm({
  active,
  locations,
  onSave,
  onCancel,
  onRequestAddLocation,
  mapPointToAdd = null,
  onMapPointConsumed,
  onPreviewChange,
}: RouteViaLocationsFormProps) {
  const [name, setName] = useState('');
  const [stops, setStops] = useState<WaypointStop[]>([]);
  const [stagingIds, setStagingIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [visibility, setVisibility] = useState<GeoVisibility>(
    defaultGeoVisibility()
  );
  const [metrics, setMetrics] = useState<{
    distanceMeters: number;
    durationSeconds: number;
  } | null>(null);
  const [geometry, setGeometry] = useState<LatLng[]>([]);
  const [errors, setErrors] = useState<{
    name?: string;
    waypoints?: string;
    visibility?: string;
  }>({});
  const [routing, setRouting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const visibleLocations = useMemo(
    () => locations.filter((l) => l.visible !== false),
    [locations]
  );

  const locById = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations]
  );

  const filteredLocations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visibleLocations;
    return visibleLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q)
    );
  }, [visibleLocations, search]);

  const waypoints = useMemo(
    () => stops.map((s) => s.position),
    [stops]
  );

  const waypointLocationIds = useMemo(
    () => stops.map((s) => s.locationId ?? ''),
    [stops]
  );

  useEffect(() => {
    if (!active) return;
    setName('');
    setStops([]);
    setStagingIds([]);
    setSearch('');
    setVisibility(defaultGeoVisibility());
    setMetrics(null);
    setGeometry([]);
    setErrors({});
  }, [active]);

  useEffect(() => {
    if (!active || !mapPointToAdd) return;
    setStops((prev) => [...prev, createMapStop(mapPointToAdd)]);
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
    onMapPointConsumed?.();
  }, [active, mapPointToAdd, onMapPointConsumed]);

  useEffect(() => {
    if (!active) {
      onPreviewChange?.([], null, []);
    }
  }, [active, onPreviewChange]);

  useEffect(() => {
    if (!active || waypoints.length < 2) {
      setMetrics(null);
      setGeometry(waypoints);
      setRouting(false);
      onPreviewChange?.(waypoints, null, waypoints);
      return;
    }
    let cancelled = false;
    setRouting(true);
    const timer = window.setTimeout(() => {
      void fetchDrivingRoute(waypoints)
        .then((result) => {
          if (cancelled) return;
          setGeometry(result.geometry);
          const m = {
            distanceMeters: result.distanceMeters,
            durationSeconds: result.durationSeconds,
          };
          setMetrics(m);
          onPreviewChange?.(result.geometry, m, waypoints);
        })
        .catch(() => {
          if (cancelled) return;
          setMetrics(null);
          setGeometry(waypoints);
          onPreviewChange?.(waypoints, null, waypoints);
        })
        .finally(() => {
          if (!cancelled) setRouting(false);
        });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waypoints, active]);

  const toggleStaging = (id: string) => {
    setStagingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const visibleIds = filteredLocations.map((l) => l.id);
    setStagingIds((prev) => {
      const merged = [...prev];
      for (const id of visibleIds) {
        if (!merged.includes(id)) merged.push(id);
      }
      return merged;
    });
  };

  const clearStaging = () => setStagingIds([]);

  const addStagingToRoute = () => {
    if (stagingIds.length === 0) return;
    setStops((prev) => [
      ...prev,
      ...stagingIds.flatMap((id) => {
        const loc = locById.get(id);
        if (!loc) return [];
        return [createLocationStop(id, loc.position)];
      }),
    ]);
    setStagingIds([]);
    setErrors((prev) => ({ ...prev, waypoints: undefined }));
  };

  const removeAt = (index: number) => {
    setStops((prev) => prev.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= stops.length) return;
    setStops((prev) => arrayMove(prev, index, next));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setStops((prev) => {
      const oldIndex = prev.findIndex((s) => s.instanceId === active.id);
      const newIndex = prev.findIndex((s) => s.instanceId === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = 'Le nom est requis.';
    if (stops.length < 2) {
      next.waypoints = 'Ajoutez au moins un départ et une arrivée.';
    }
    const visibilityError = validateGeoVisibility(visibility);
    if (visibilityError) next.visibility = visibilityError;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSave({
      name: name.trim(),
      assignment: emptyAssignment(),
      alertType: 'les_deux' satisfies GeofenceAlertType,
      visibility,
      points: geometry.length >= 2 ? geometry : waypoints,
      waypoints,
      waypointLocationIds,
      distanceMeters: metrics?.distanceMeters,
      durationSeconds: metrics?.durationSeconds,
    });
  };

  if (!active) return null;

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {stops.length >= 2 && (
          <RouteMetricsSummary
            distanceMeters={metrics?.distanceMeters}
            durationSeconds={metrics?.durationSeconds}
            loading={routing}
          />
        )}

        <p className="text-xs text-slate-500 leading-relaxed rounded-lg border border-sky-100 bg-sky-50/60 px-3 py-2 flex gap-2">
          <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
          Cliquez sur la carte pour ajouter un point, ou sélectionnez des
          emplacements ci-dessous.
        </p>

        <div className="space-y-1.5">
          <Label htmlFor="route-via-name">Nom de la route</Label>
          <Input
            id="route-via-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Tunis → Sousse"
          />
          {errors.name && (
            <p className="text-xs text-rose-600">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Itinéraire (départ → étapes → arrivée)</Label>
          {stops.length === 0 ? (
            <p className="text-xs text-slate-500 py-2">
              Aucun point — cliquez sur la carte ou sélectionnez des
              emplacements.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={stops.map((s) => s.instanceId)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1.5">
                  {stops.map((stop, index) => {
                    const loc = stop.locationId
                      ? locById.get(stop.locationId)
                      : undefined;
                    const role =
                      index === 0
                        ? 'Départ'
                        : index === stops.length - 1
                          ? 'Arrivée'
                          : `Étape ${index}`;
                    const displayName = loc
                      ? loc.name
                      : formatMapPointLabel(stop.position);
                    return (
                      <SortableStopRow
                        key={stop.instanceId}
                        stop={stop}
                        index={index}
                        total={stops.length}
                        name={displayName}
                        role={role}
                        onMove={move}
                        onRemove={removeAt}
                      />
                    );
                  })}
                </ul>
              </SortableContext>
            </DndContext>
          )}

          <div className="space-y-2 rounded-lg border border-slate-200 p-2.5 bg-white">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-xs text-slate-600">
                Ajouter des emplacements
              </Label>
              {stagingIds.length > 0 && (
                <Badge variant="info" className="text-[10px] h-5">
                  {stagingIds.length} sélectionné
                  {stagingIds.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un emplacement…"
                className="pl-8 h-9 text-sm"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <button
                type="button"
                onClick={selectAllFiltered}
                disabled={filteredLocations.length === 0}
                className="text-[10px] text-blue-600 hover:underline disabled:text-slate-300 disabled:no-underline"
              >
                Tout sélectionner
              </button>
              <button
                type="button"
                onClick={clearStaging}
                disabled={stagingIds.length === 0}
                className="text-[10px] text-slate-500 hover:underline disabled:text-slate-300 disabled:no-underline"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={onRequestAddLocation}
                className="text-[10px] text-emerald-600 hover:underline ml-auto"
              >
                Créer un emplacement…
              </button>
            </div>

            <div className="max-h-36 overflow-y-auto rounded-md border border-slate-200 divide-y divide-slate-100">
              {filteredLocations.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">
                  Aucun emplacement — cliquez la carte ou créez-en un.
                </p>
              ) : (
                filteredLocations.map((loc) => {
                  const checked = stagingIds.includes(loc.id);
                  return (
                    <label
                      key={loc.id}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleStaging(loc.id)}
                      />
                      <span className="truncate text-slate-800">
                        {loc.name}
                      </span>
                    </label>
                  );
                })
              )}
            </div>

            <Button
              type="button"
              className="w-full gap-1.5"
              size="sm"
              onClick={addStagingToRoute}
              disabled={stagingIds.length === 0}
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter à l&apos;itinéraire
              {stagingIds.length > 0 ? ` (${stagingIds.length})` : ''}
            </Button>
            <p className="text-[10px] text-slate-400">
              Glissez l&apos;icône ⋮⋮ pour réordonner. Doublons autorisés.
            </p>
          </div>

          {errors.waypoints && (
            <p className="text-xs text-rose-600">{errors.waypoints}</p>
          )}
        </div>

        <GeoVisibilityFields
          visibility={visibility}
          onChange={setVisibility}
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
        <Button
          type="button"
          className="flex-1"
          onClick={handleSave}
          disabled={routing}
        >
          Enregistrer
        </Button>
      </div>
    </>
  );
}
