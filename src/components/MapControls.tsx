import { useEffect, useRef, useState, type ComponentType } from 'react';
import {
  Eye,
  EyeOff,
  Layers,
  Route,
  Check,
  SlidersHorizontal,
  CircleDot,
  MapPinned,
  Pentagon,
  PanelRightClose,
  Undo2,
} from 'lucide-react';
import type {
  BasemapType,
  DrawMode,
  ManageOverlayKind,
  MapOverlay,
} from '../types/map-overlays';
import { BASEMAP_TILES } from '../types/map-overlays';

type OpenMenu = 'geo' | 'visibility' | 'layers' | 'hide' | null;

const toolbarBtn =
  'h-9 w-9 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-xl border transition-colors';
const toolbarIdle =
  'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
const toolbarActive = 'border-blue-200 bg-blue-50 text-blue-700';

function overlayKindLabel(kind: MapOverlay['kind']): string {
  if (kind === 'geofence') return 'Géopérage';
  if (kind === 'location') return 'Emplacement';
  if (kind === 'route') return 'Route';
  if (kind === 'defaultZone') return 'Zone';
  return 'Polygone';
}

function MenuRow({
  icon: Icon,
  chip,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>;
  chip: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition-colors text-left"
    >
      <span
        className={`h-8 w-8 rounded-lg inline-flex items-center justify-center shrink-0 ${chip}`}
      >
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </button>
  );
}

interface MapControlsProps {
  basemap: BasemapType;
  onBasemapChange: (b: BasemapType) => void;
  clusterVehicles: boolean;
  onClusterVehiclesChange: (v: boolean) => void;
  clusterLocations: boolean;
  onClusterLocationsChange: (v: boolean) => void;
  drawMode: DrawMode;
  /** Edit geometry from Manage (polygon/route) without create drawMode */
  geometryEditKind?: 'polygon' | 'route' | null;
  onOpenManage: (kind: ManageOverlayKind) => void;
  overlays: MapOverlay[];
  onSetOverlayVisible: (id: string, visible: boolean) => void;
  pendingPointsCount: number;
  onFinishDraw: () => void;
  onCancelDraw: () => void;
  onUndoPoint?: () => void;
  onRedoPoint?: () => void;
  routeCreateOpen?: boolean;
  /** When creating a route from locations, show map-pick hint */
  routeCreateMode?: 'locations' | 'map' | null;
  geofenceModalOpen?: boolean;
  geofenceGeometryActive?: boolean;
  canUndoMapEdit?: boolean;
  canRedoMapEdit?: boolean;
  hasOverlayDraft?: boolean;
  polygonDrawError?: string | null;
  onMenuChange?: (menu: OpenMenu) => void;
  onExpandedChange?: (expanded: boolean) => void;
}

export function MapControls({
  basemap,
  onBasemapChange,
  clusterVehicles,
  onClusterVehiclesChange,
  clusterLocations,
  onClusterLocationsChange,
  drawMode,
  geometryEditKind = null,
  onOpenManage,
  overlays,
  onSetOverlayVisible,
  pendingPointsCount,
  onFinishDraw,
  onCancelDraw,
  onUndoPoint,
  onRedoPoint,
  routeCreateOpen = false,
  routeCreateMode = null,
  geofenceModalOpen = false,
  geofenceGeometryActive = false,
  canUndoMapEdit = false,
  canRedoMapEdit = false,
  hasOverlayDraft = false,
  polygonDrawError,
  onMenuChange,
  onExpandedChange,
}: MapControlsProps) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onExpandedChange?.(!isCollapsed);
  }, [isCollapsed, onExpandedChange]);

  useEffect(() => {
    onMenuChange?.(openMenu);
  }, [openMenu, onMenuChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      const isFormFieldFocused = () => {
        const tag = (event.target as HTMLElement)?.tagName;
        return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      };
      const geoActive =
        !!drawMode || !!geometryEditKind || geofenceGeometryActive;
      const mod = event.ctrlKey || event.metaKey;
      const drawingSessionActive =
        !!drawMode ||
        !!geometryEditKind ||
        routeCreateOpen ||
        geofenceModalOpen ||
        hasOverlayDraft;

      if (
        event.key === 'Backspace' &&
        geoActive &&
        canUndoMapEdit
      ) {
        if (isFormFieldFocused()) return;
        event.preventDefault();
        onUndoPoint?.();
        return;
      }
      if (mod && event.key === 'z' && !event.shiftKey && geoActive) {
        if (isFormFieldFocused()) return;
        if (canUndoMapEdit) {
          event.preventDefault();
          onUndoPoint?.();
        }
        return;
      }
      if (
        mod &&
        geoActive &&
        (event.key === 'y' || (event.key === 'z' && event.shiftKey))
      ) {
        if (isFormFieldFocused()) return;
        if (canRedoMapEdit) {
          event.preventDefault();
          onRedoPoint?.();
        }
        return;
      }
      if (
        event.key === 'Enter' &&
        drawMode === 'route' &&
        pendingPointsCount >= 2
      ) {
        if (isFormFieldFocused()) return;
        event.preventDefault();
        onFinishDraw();
        return;
      }
      if (
        event.key === 'Enter' &&
        drawMode === 'polygon' &&
        pendingPointsCount >= 3
      ) {
        if (isFormFieldFocused()) return;
        event.preventDefault();
        onFinishDraw();
        return;
      }
      if (event.key === 'Escape') {
        if (openMenu) {
          setOpenMenu(null);
          return;
        }
        if (drawingSessionActive) {
          onCancelDraw();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [
    drawMode,
    geometryEditKind,
    geofenceGeometryActive,
    canUndoMapEdit,
    canRedoMapEdit,
    hasOverlayDraft,
    onCancelDraw,
    openMenu,
    onRedoPoint,
    onUndoPoint,
    pendingPointsCount,
    onFinishDraw,
    routeCreateOpen,
    geofenceModalOpen,
  ]);

  const toggleMenu = (menu: OpenMenu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const manageableOverlays = overlays.filter((o) => o.kind !== 'defaultZone');

  const setAllOverlaysVisible = (visible: boolean) => {
    manageableOverlays.forEach((o) => onSetOverlayVisible(o.id, visible));
  };

  const canFinishRoute = drawMode === 'route' && pendingPointsCount >= 2;
  const canFinishPolygon = drawMode === 'polygon' && pendingPointsCount >= 3;
  const showCreateBanner = !!drawMode;
  const showEditBanner = !!geometryEditKind && !drawMode;
  const showLocationsRouteBanner =
    routeCreateOpen && routeCreateMode === 'locations' && !drawMode;
  const shortcutHints =
    'Échap annuler · Ctrl+Z annuler point · Ctrl+Y rétablir';

  return (
    <div
      ref={toolbarRef}
      className="absolute top-2 right-2 sm:top-4 sm:right-4 z-40 flex flex-col items-end gap-1 sm:gap-2"
    >
      {showLocationsRouteBanner && (
        <div className="bg-slate-900/90 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg max-w-[calc(100vw-1rem)] sm:max-w-sm">
          Cliquez pour ajouter un point à l&apos;itinéraire
        </div>
      )}

      {showEditBanner && (
        <div className="bg-slate-900/90 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg max-w-[calc(100vw-1rem)] sm:max-w-sm flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex-1">
              {geometryEditKind === 'polygon' &&
                `Modification du polygone : ${pendingPointsCount} sommet(s) — ${shortcutHints}`}
              {geometryEditKind === 'route' &&
                `Modification de la route : ${pendingPointsCount} point(s) — ${shortcutHints}`}
            </span>
            {pendingPointsCount > 0 && onUndoPoint && (
              <button
                type="button"
                onClick={onUndoPoint}
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-1"
                title="Annuler le dernier point (Ctrl+Z)"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}
          </div>
          {polygonDrawError && (
            <p className="text-amber-300 text-[11px]">{polygonDrawError}</p>
          )}
        </div>
      )}

      {showCreateBanner && (
        <div className="bg-slate-900/90 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-lg max-w-[calc(100vw-1rem)] sm:max-w-sm flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="flex-1">
              {drawMode === 'geofence' &&
                `Géopérage : maintenez le clic et glissez · centre pour déplacer · bord pour le rayon · ${shortcutHints}`}
              {drawMode === 'location' &&
                'Cliquez sur la carte pour ajouter un emplacement'}
              {drawMode === 'route' &&
                `Itinéraire : ${pendingPointsCount} point(s) — min. 2 · Entrée pour terminer · ${shortcutHints}`}
              {drawMode === 'polygon' &&
                `Polygone : ${pendingPointsCount} point(s) — min. 3 · Clic droit pour fermer · ${shortcutHints}`}
            </span>
            {pendingPointsCount > 0 && onUndoPoint && (
              <button
                type="button"
                onClick={onUndoPoint}
                className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-1"
                title="Annuler le dernier point (Ctrl+Z)"
              >
                <Undo2 className="w-3 h-3" />
              </button>
            )}
            {(canFinishRoute || canFinishPolygon) && (
              <button
                type="button"
                onClick={onFinishDraw}
                className="px-2 py-1 rounded-md bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold"
              >
                Terminer
              </button>
            )}
            <button
              type="button"
              onClick={onCancelDraw}
              className="px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs"
            >
              Annuler
            </button>
          </div>
          {polygonDrawError && drawMode === 'polygon' && (
            <p className="text-amber-300 text-[11px]">{polygonDrawError}</p>
          )}
        </div>
      )}

      {isCollapsed ? (
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className={`${toolbarBtn} ${toolbarIdle} bg-white/95 backdrop-blur-xl shadow-lg`}
          title="Afficher les contrôles carte"
          aria-label="Afficher les contrôles carte"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      ) : (
        <div className="flex flex-col items-center gap-1 bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg border border-slate-200">
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('geo')}
              className={`${toolbarBtn} ${
                openMenu === 'geo' || drawMode ? toolbarActive : toolbarIdle
              }`}
              title="Opération Géographique"
              aria-label="Opération Géographique"
              aria-expanded={openMenu === 'geo'}
            >
              <CircleDot className="w-5 h-5" />
            </button>

            {openMenu === 'geo' && (
              <div
                className="absolute right-full top-0 mr-2 w-[min(288px,calc(100vw-1rem))] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Opérations géographiques
                  </h3>
                </div>
                <div className="p-2">
                  <MenuRow
                    icon={CircleDot}
                    chip="bg-blue-50 text-blue-600"
                    label="Géopérages"
                    onClick={() => {
                      onOpenManage('geofence');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={Route}
                    chip="bg-sky-50 text-sky-600"
                    label="Itinéraires"
                    onClick={() => {
                      onOpenManage('route');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={MapPinned}
                    chip="bg-emerald-50 text-emerald-600"
                    label="Emplacements"
                    onClick={() => {
                      onOpenManage('location');
                      setOpenMenu(null);
                    }}
                  />
                  <MenuRow
                    icon={Pentagon}
                    chip="bg-violet-50 text-violet-600"
                    label="Polygones"
                    onClick={() => {
                      onOpenManage('polygon');
                      setOpenMenu(null);
                    }}
                  />

                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('visibility')}
              className={`${toolbarBtn} ${
                openMenu === 'visibility' ? toolbarActive : toolbarIdle
              }`}
              title="Visibilité"
              aria-label="Visibilité"
              aria-expanded={openMenu === 'visibility'}
            >
              <Eye className="w-5 h-5" />
            </button>

            {openMenu === 'visibility' && (
              <div className="absolute right-full top-0 mr-2 w-[min(288px,calc(100vw-1rem))] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Visibilité
                  </h3>
                </div>
                <div className="p-2">
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clusterVehicles}
                      onChange={(e) =>
                        onClusterVehiclesChange(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      Regrouper les véhicules en secteurs
                    </span>
                  </label>
                  <label className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={clusterLocations}
                      onChange={(e) =>
                        onClusterLocationsChange(e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-800">
                      Regrouper les emplacements en secteurs
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('layers')}
              className={`${toolbarBtn} ${
                openMenu === 'layers' ? toolbarActive : toolbarIdle
              }`}
              title="Map Layer"
              aria-label="Map Layer"
              aria-expanded={openMenu === 'layers'}
            >
              <Layers className="w-5 h-5" />
            </button>

            {openMenu === 'layers' && (
              <div className="absolute right-full top-0 mr-2 w-[min(208px,calc(100vw-1rem))] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Vue de la carte
                  </h3>
                </div>
                <div className="p-2">
                  {(Object.keys(BASEMAP_TILES) as BasemapType[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onBasemapChange(key);
                        setOpenMenu(null);
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                        basemap === key
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {BASEMAP_TILES[key].label}
                      </span>
                      {basemap === key && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu('hide')}
              className={`${toolbarBtn} ${
                openMenu === 'hide' ? toolbarActive : toolbarIdle
              }`}
              title="Masquer / afficher les couches"
              aria-label="Masquer / afficher les couches"
              aria-expanded={openMenu === 'hide'}
            >
              <EyeOff className="w-5 h-5" />
            </button>

            {openMenu === 'hide' && (
              <div className="absolute right-full top-0 mr-2 w-[min(288px,calc(100vw-1rem))] max-h-[calc(100dvh-6rem)] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Masquer / afficher les couches
                  </h3>
                </div>
                {manageableOverlays.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">
                    Aucune couche à masquer
                  </div>
                ) : (
                  <>
                    <div className="p-2 max-h-48 overflow-y-auto">
                      {manageableOverlays.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 rounded-lg"
                        >
                          <span
                            className={`text-sm truncate flex-1 ${
                              o.visible
                                ? 'text-slate-800 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {o.name}
                          </span>
                          <span className="text-[10px] uppercase text-slate-400 font-medium">
                            {overlayKindLabel(o.kind)}
                          </span>
                          <button
                            type="button"
                            title={o.visible ? 'Masquer' : 'Afficher'}
                            aria-label={o.visible ? 'Masquer' : 'Afficher'}
                            onClick={() =>
                              onSetOverlayVisible(o.id, !o.visible)
                            }
                            className={`p-1.5 rounded-md transition-colors ${
                              o.visible
                                ? 'text-blue-600 hover:bg-blue-50'
                                : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            {o.visible ? (
                              <Eye className="w-4 h-4" />
                            ) : (
                              <EyeOff className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-slate-100 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAllOverlaysVisible(false)}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Masquer tout
                      </button>
                      <button
                        type="button"
                        onClick={() => setAllOverlaysVisible(true)}
                        className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                      >
                        Afficher tout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenMenu(null);
              setIsCollapsed(true);
            }}
            className={`${toolbarBtn} ${toolbarIdle}`}
            title="Masquer les contrôles carte"
            aria-label="Masquer les contrôles carte"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
