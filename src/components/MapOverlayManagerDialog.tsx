import type {
  DefaultZoneOverlay,
  GeofenceOverlay,
  LocationOverlay,
  ManageOverlayKind,
  PolygonOverlay,
  RouteOverlay,
  LatLng,
} from '@/types/map-overlays';
import {
  formatRouteDistance,
  formatRouteDuration,
} from '@/types/map-overlays';
import { Button } from '@/components/ui/button';
import { MapSidePanel } from '@/components/MapSidePanel';
import {
  ArrowLeft,
  CircleDot,
  Eye,
  Landmark,
  LocateFixed,
  MapPinned,
  Pencil,
  Pentagon,
  Plus,
  Route,
  Trash2,
} from 'lucide-react';
import type { ComponentType } from 'react';

const TITLES: Record<ManageOverlayKind, string> = {
  location: 'Emplacements',
  route: 'Itinéraires',
  polygon: 'Polygones',
  geofence: 'Géopérages',
  defaultZone: 'Zones par défaut',
};

const KIND_VISUAL: Record<
  ManageOverlayKind,
  { icon: ComponentType<{ className?: string }>; chip: string }
> = {
  geofence: { icon: CircleDot, chip: 'bg-blue-50 text-blue-600' },
  location: { icon: MapPinned, chip: 'bg-emerald-50 text-emerald-600' },
  polygon: { icon: Pentagon, chip: 'bg-violet-50 text-violet-600' },
  route: { icon: Route, chip: 'bg-sky-50 text-sky-600' },
  defaultZone: { icon: Landmark, chip: 'bg-amber-50 text-amber-600' },
};

type ManageItem =
  | LocationOverlay
  | RouteOverlay
  | PolygonOverlay
  | GeofenceOverlay
  | DefaultZoneOverlay;

interface MapOverlayManagePanelProps {
  kind: ManageOverlayKind;
  locations: LocationOverlay[];
  routes: RouteOverlay[];
  polygons: PolygonOverlay[];
  geofences: GeofenceOverlay[];
  defaultZones: DefaultZoneOverlay[];
  countryLabel?: string;
  onBack: () => void;
  onDelete: (id: string) => void;
  onFlyTo: (center: LatLng) => void;
  onToggleVisible: (id: string, visible: boolean) => void;
  onEdit: (kind: ManageOverlayKind, id: string) => void;
  onHighlightZone?: (id: string | null) => void;
  /** Start create flow for the current kind (geofence / location / polygon / route) */
  onCreate?: () => void;
  onCreateRoute?: () => void;
}

export function MapOverlayManagePanel({
  kind,
  locations,
  routes,
  polygons,
  geofences,
  defaultZones,
  countryLabel = 'Tunisie',
  onBack,
  onDelete,
  onFlyTo,
  onToggleVisible,
  onEdit,
  onHighlightZone,
  onCreate,
  onCreateRoute,
}: MapOverlayManagePanelProps) {
  const items: ManageItem[] =
    kind === 'location'
      ? locations
      : kind === 'route'
        ? routes
        : kind === 'geofence'
          ? geofences
          : kind === 'defaultZone'
            ? defaultZones
            : polygons;

  const getCenter = (item: ManageItem): LatLng => {
    if (item.kind === 'location') return item.position;
    if (item.kind === 'geofence') return item.center;
    if (item.kind === 'defaultZone') {
      const pts = item.points;
      if (!pts.length) return [36.8, 10.18];
      const lat =
        pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const lng =
        pts.reduce((s, p) => s + p[1], 0) / pts.length;
      return [lat, lng];
    }
    return item.points[0] ?? [36.8, 10.18];
  };

  const KindIcon = KIND_VISUAL[kind].icon;
  const readonly = kind === 'defaultZone';

  return (
    <MapSidePanel>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
          title="Retour à la liste des véhicules"
          aria-label="Retour"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span
          className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${KIND_VISUAL[kind].chip}`}
        >
          <KindIcon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-slate-800 truncate">
            {TITLES[kind]}
          </h2>
          {kind === 'defaultZone' && (
            <p className="text-[11px] text-slate-500 truncate">
              Provinces — {countryLabel}
            </p>
          )}
        </div>
      </div>

      {(() => {
        const createHandler =
          kind === 'route' ? onCreate ?? onCreateRoute : onCreate;
        if (!createHandler || kind === 'defaultZone') return null;
        const createLabel =
          kind === 'geofence'
            ? 'Ajouter un géopérage'
            : kind === 'location'
              ? 'Ajouter un emplacement'
              : kind === 'polygon'
                ? 'Ajouter un polygone'
                : 'Ajouter un itinéraire';
        return (
          <div className="px-4 pt-3">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={createHandler}
            >
              <Plus className="w-4 h-4" />
              {createLabel}
            </Button>
          </div>
        );
      })()}

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">
            Aucun élément enregistré.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => {
              const routeMetrics =
                item.kind === 'route'
                  ? `${formatRouteDistance(item.distanceMeters)} · ${formatRouteDuration(item.durationSeconds)}`
                  : null;

              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2 px-2 py-2 rounded-xl border border-slate-100 bg-slate-50/50"
                >
                  <span
                    className={`h-8 w-8 mt-0.5 rounded-lg inline-flex items-center justify-center shrink-0 ${KIND_VISUAL[kind].chip}`}
                  >
                    <KindIcon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      className="text-sm font-medium text-slate-800 truncate text-left w-full hover:text-blue-700"
                      onClick={() => {
                        onFlyTo(getCenter(item));
                        if (item.kind === 'defaultZone') {
                          onToggleVisible(item.id, true);
                          onHighlightZone?.(item.id);
                        }
                      }}
                    >
                      {item.name}
                    </button>
                    {routeMetrics && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {routeMetrics}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      title={item.visible ? 'Masquer' : 'Afficher'}
                      aria-label={item.visible ? 'Masquer' : 'Afficher'}
                      onClick={() => onToggleVisible(item.id, !item.visible)}
                      className={`p-1.5 rounded-md transition-colors ${
                        item.visible
                          ? 'text-blue-600 hover:bg-blue-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Centrer sur la carte"
                      aria-label="Centrer sur la carte"
                      onClick={() => {
                        onFlyTo(getCenter(item));
                        if (item.kind === 'defaultZone') {
                          onToggleVisible(item.id, true);
                          onHighlightZone?.(item.id);
                        }
                      }}
                      className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-slate-800"
                    >
                      <LocateFixed className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Modifier"
                      aria-label="Modifier"
                      onClick={() => onEdit(kind, item.id)}
                      className="p-1.5 rounded-md text-slate-600 hover:bg-white hover:text-blue-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {!readonly && (
                      <button
                        type="button"
                        title="Supprimer"
                        aria-label="Supprimer"
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={onBack}
        >
          Fermer
        </Button>
      </div>
    </MapSidePanel>
  );
}
