import { Fragment, useEffect, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  Circle,
  Rectangle,
  Polygon,
  Polyline,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Vehicle } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapLegend } from './MapLegend';
import { VehicleMapInfoCard } from './VehicleMapInfoCard';
import type { VehicleCardActions } from './VehicleMapInfoCard';
import {
  FIQ,
  FLEETIQ_MARKER_BOX,
  fleetiqMarkerHtml,
  toFleetiqStatus,
  toFleetiqType,
} from '@/features/fleetiq/vehicle-sprite';
import {
  ensureAlertStore,
  getCriticalAlertVehicleIds,
} from '@/features/fleetiq/vehicle-card-data';
import { cardCoveredWidth, cardDockLeft } from '@/features/fleetiq/map-dock';
import { TripReplayLayer, type TripReplayRequest } from './TripReplay';
import type {
  BasemapType,
  DefaultZoneOverlay,
  DrawMode,
  GeofenceDraft,
  GeofenceOverlay,
  GeofenceShapeType,
  LatLng,
  LocationOverlay,
  PolygonOverlay,
  RouteOverlay,
} from '../types/map-overlays';
import {
  BASEMAP_TILES,
  formatRouteDistance,
  formatRouteDuration,
  midpointOfPolyline,
  rectangleBoundsFromCenter,
} from '../types/map-overlays';
import { fetchDrivingRoute } from '../lib/osrm-routing';
import { approxPxDistance } from '../lib/polygon-geometry';
import { getTunisiaProvince } from '../data/tunisia-provinces';

/** Fly so `latlng` lands in the middle of the map area not covered by the docked card */
function flyToBesideCard(map: L.Map, latlng: L.LatLngExpression, zoom: number, duration: number) {
  const inset = cardCoveredWidth(map);
  const target = map.project(latlng, zoom).subtract([inset / 2, 0]);
  map.flyTo(map.unproject(target, zoom), zoom, { animate: true, duration });
}

/** Vehicle card docked at the top-left of the map (stays put while the map moves) */
function SelectedVehiclePopupOverlay({
  vehicle,
  onClose,
  actions,
}: {
  vehicle: Vehicle;
  onClose: () => void;
  actions?: VehicleCardActions;
}) {
  const map = useMap();
  const [point, setPoint] = useState({ x: 16, y: 16 });

  useEffect(() => {
    const update = () => {
      const bounds = map.getContainer().getBoundingClientRect();
      setPoint({ x: bounds.left + cardDockLeft(map), y: bounds.top + 16 });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(map.getContainer());
    const panel = document.querySelector('[data-left-panel]');
    if (panel) observer.observe(panel);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [map]);

  return createPortal(
    <div
      className="leaflet-vehicle-info-popup"
      style={{
        position: 'fixed',
        left: point.x,
        top: point.y,
        zIndex: 1100,
        pointerEvents: 'auto',
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
    >
      <VehicleMapInfoCard vehicle={vehicle} onClose={onClose} actions={actions} />
    </div>,
    document.body
  );
}

const MIN_RADIUS_KM = 0.05;
const MAX_RADIUS_KM = 50;
const POLYGON_SNAP_PX = 14;

const ROUTE_LINE = { color: '#2563eb', weight: 5, opacity: 1 };
const ROUTE_CASING = { color: '#ffffff', weight: 8, opacity: 0.9 };
const ROUTE_DRAFT = {
  color: '#3b82f6',
  weight: 4,
  dashArray: '8 6',
  opacity: 0.85,
};
const POLYGON_DRAFT = {
  color: '#8b5cf6',
  fillColor: '#8b5cf6',
  fillOpacity: 0.12,
  weight: 2,
  dashArray: '6 4',
};

function clampRadiusKm(km: number): number {
  const clamped = Math.min(MAX_RADIUS_KM, Math.max(MIN_RADIUS_KM, km));
  return Math.round(clamped * 100) / 100;
}

function resizeHandlePosition(
  center: LatLng,
  radiusKm: number,
  shapeType: GeofenceShapeType
): LatLng {
  const [lat, lng] = center;
  if (shapeType === 'circulaire') {
    const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
    return [lat, lng + dLng];
  }
  const bounds = rectangleBoundsFromCenter(center, radiusKm);
  return [bounds[1][0], bounds[1][1]];
}

function radiusKmFromPointer(
  map: L.Map,
  center: LatLng,
  pointer: L.LatLng,
  shapeType: GeofenceShapeType
): number {
  if (shapeType === 'circulaire') {
    return clampRadiusKm(map.distance(L.latLng(center), pointer) / 1000);
  }
  const [lat, lng] = center;
  const dLatKm = Math.abs(pointer.lat - lat) * 111;
  const dLngKm =
    Math.abs(pointer.lng - lng) * 111 * Math.cos((lat * Math.PI) / 180);
  return clampRadiusKm(Math.max(dLatKm, dLngKm));
}

function MapController({
  selectedVehicle,
  mapCenter,
  mapCenterZoom,
  onMapCenterChange,
  flyToTarget,
  flyToZoom,
  onFlyToDone,
  fitBoundsPoints,
  onFitBoundsDone,
}: {
  selectedVehicle: Vehicle | null;
  mapCenter: [number, number] | null;
  mapCenterZoom?: number | null;
  onMapCenterChange: () => void;
  flyToTarget: LatLng | null;
  flyToZoom?: number | null;
  onFlyToDone: () => void;
  fitBoundsPoints: LatLng[] | null;
  onFitBoundsDone: () => void;
}) {
  const map = useMap();
  // Fly to the selected vehicle once per selection (not after every fit / fly)
  const flownToRef = useRef<string | null>(null);
  useEffect(() => {
    if (fitBoundsPoints?.length) {
      map.fitBounds(fitBoundsPoints, {
        paddingTopLeft: [selectedVehicle ? Math.max(380, cardCoveredWidth(map) + 32) : 380, 48],
        paddingBottomRight: [48, 48],
        animate: true,
        duration: 1.2,
      });
      onFitBoundsDone();
      return;
    }
    if (flyToTarget) {
      map.flyTo(flyToTarget, flyToZoom ?? 15, { animate: true, duration: 1.2 });
      onFlyToDone();
      return;
    }
    if (mapCenter) {
      if (selectedVehicle) flyToBesideCard(map, mapCenter, mapCenterZoom ?? 16, 1.5);
      else map.flyTo(mapCenter, mapCenterZoom ?? 16, { animate: true, duration: 1.5 });
      onMapCenterChange();
    } else if (selectedVehicle && flownToRef.current !== selectedVehicle.id) {
      flyToBesideCard(map, selectedVehicle.coordinates, 15, 1.5);
    }
    flownToRef.current = selectedVehicle?.id ?? null;
  }, [
    selectedVehicle,
    mapCenter,
    mapCenterZoom,
    map,
    onMapCenterChange,
    flyToTarget,
    flyToZoom,
    onFlyToDone,
    fitBoundsPoints,
    onFitBoundsDone,
  ]);
  return null;
}

function RouteMetricsBadge({
  geometry,
  distanceMeters,
  durationSeconds,
}: {
  geometry: LatLng[];
  distanceMeters?: number;
  durationSeconds?: number;
}) {
  const mid = midpointOfPolyline(geometry);
  if (!mid || distanceMeters == null) return null;
  const label = `${formatRouteDistance(distanceMeters)} · ${formatRouteDuration(durationSeconds)}`;
  // Approximate pill size so Leaflet doesn't clip white text onto the map
  const width = Math.max(88, Math.ceil(label.length * 7.2) + 24);
  const height = 28;

  return (
    <Marker
      position={mid}
      interactive={false}
      icon={L.divIcon({
        className: 'route-metrics-badge',
        html: `<div style="
          width: ${width}px;
          height: ${height}px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
          white-space: nowrap;
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
          padding: 0 12px;
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(15,23,42,0.35);
          border: 1px solid rgba(255,255,255,0.18);
          text-shadow: 0 1px 2px rgba(0,0,0,0.45);
        ">${label}</div>`,
        iconSize: [width, height],
        iconAnchor: [width / 2, height / 2],
      })}
    />
  );
}

function PendingRoutePreview({
  waypoints,
}: {
  waypoints: LatLng[];
}) {
  const [geometry, setGeometry] = useState<LatLng[]>(waypoints);

  useEffect(() => {
    if (waypoints.length < 2) {
      setGeometry(waypoints);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchDrivingRoute(waypoints).then((route) => {
        if (cancelled) return;
        setGeometry(route.geometry);
      });
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [waypoints]);

  if (geometry.length < 2) return null;

  return <Polyline positions={geometry} pathOptions={ROUTE_DRAFT} />;
}

function PolygonCursorTracker({
  enabled,
  onCursor,
}: {
  enabled: boolean;
  onCursor: (latlng: LatLng | null) => void;
}) {
  useMapEvents({
    mousemove(e) {
      if (!enabled) return;
      onCursor([e.latlng.lat, e.latlng.lng]);
    },
    mouseout() {
      if (enabled) onCursor(null);
    },
  });
  return null;
}

function MapClickHandler({
  enabled,
  onMapClick,
  skipClickRef,
  pendingPoints,
  drawMode,
  onFinishPolygon,
}: {
  enabled: boolean;
  onMapClick: (latlng: LatLng) => void;
  skipClickRef: MutableRefObject<boolean>;
  pendingPoints: LatLng[];
  drawMode: DrawMode;
  onFinishPolygon?: () => void;
}) {
  const map = useMap();
  useMapEvents({
    click(e) {
      if (!enabled) return;
      if (skipClickRef.current) {
        skipClickRef.current = false;
        return;
      }
      const latlng: LatLng = [e.latlng.lat, e.latlng.lng];

      // Snap-close polygon when clicking near first vertex
      if (
        drawMode === 'polygon' &&
        pendingPoints.length >= 3 &&
        onFinishPolygon
      ) {
        const zoom = map.getZoom();
        const dist = approxPxDistance(pendingPoints[0], latlng, zoom);
        if (dist <= POLYGON_SNAP_PX) {
          onFinishPolygon();
          return;
        }
      }

      onMapClick(latlng);
    },
    contextmenu(e) {
      // Close polygon on right-click (min. 3 points)
      if (
        !enabled ||
        drawMode !== 'polygon' ||
        pendingPoints.length < 3 ||
        !onFinishPolygon
      ) {
        return;
      }
      e.originalEvent.preventDefault();
      onFinishPolygon();
    },
  });
  return null;
}

function DrawCursor({
  drawMode,
  isResizing,
  isMoving,
}: {
  drawMode: DrawMode;
  isResizing: boolean;
  isMoving: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    if (isResizing || isMoving) {
      container.style.cursor = 'grabbing';
    } else {
      container.style.cursor = drawMode ? 'crosshair' : '';
    }
    return () => {
      container.style.cursor = '';
    };
  }, [map, drawMode, isResizing, isMoving]);
  return null;
}

function GeofencePlaceHandler({
  enabled,
  shapeType,
  onPlaceStart,
  onPlaceProgress,
  onPlaceEnd,
  skipClickRef,
  onResizingChange,
}: {
  enabled: boolean;
  shapeType: GeofenceShapeType;
  onPlaceStart: (center: LatLng, radiusKm: number) => void;
  onPlaceProgress: (center: LatLng, radiusKm: number) => void;
  onPlaceEnd: () => void;
  skipClickRef: MutableRefObject<boolean>;
  onResizingChange: (v: boolean) => void;
}) {
  const map = useMap();
  const placingRef = useRef(false);
  const centerRef = useRef<LatLng | null>(null);

  const stopPlace = () => {
    if (!placingRef.current) return;
    placingRef.current = false;
    centerRef.current = null;
    onResizingChange(false);
    skipClickRef.current = true;
    map.dragging.enable();
    onPlaceEnd();
  };

  useMapEvents({
    mousedown(e) {
      if (!enabled || placingRef.current) return;
      if ((e.originalEvent as MouseEvent).button !== 0) return;
      L.DomEvent.preventDefault(e.originalEvent);
      L.DomEvent.stopPropagation(e.originalEvent);
      const center: LatLng = [e.latlng.lat, e.latlng.lng];
      placingRef.current = true;
      centerRef.current = center;
      onResizingChange(true);
      map.dragging.disable();
      onPlaceStart(center, MIN_RADIUS_KM);
    },
    mousemove(e) {
      if (!placingRef.current || !centerRef.current) return;
      onPlaceProgress(
        centerRef.current,
        radiusKmFromPointer(map, centerRef.current, e.latlng, shapeType)
      );
    },
    mouseup: stopPlace,
  });

  useEffect(() => {
    window.addEventListener('mouseup', stopPlace);
    return () => window.removeEventListener('mouseup', stopPlace);
  });

  return null;
}

function GeofenceDraftEditor({
  draft,
  onCenterChange,
  onRadiusChange,
  onGeometryInteractionStart,
  skipClickRef,
  onResizingChange,
  onMovingChange,
}: {
  draft: GeofenceDraft;
  onCenterChange: (center: LatLng) => void;
  onRadiusChange: (km: number) => void;
  onGeometryInteractionStart?: () => void;
  skipClickRef: MutableRefObject<boolean>;
  onResizingChange: (v: boolean) => void;
  onMovingChange: (v: boolean) => void;
}) {
  const map = useMap();
  const [liveCenter, setLiveCenter] = useState<LatLng>(draft.center);
  const [liveRadiusKm, setLiveRadiusKm] = useState(draft.radiusKm);
  const modeRef = useRef<'idle' | 'move' | 'resize'>('idle');
  const centerRef = useRef<LatLng>(draft.center);

  useEffect(() => {
    if (modeRef.current !== 'idle') return;
    setLiveCenter(draft.center);
    setLiveRadiusKm(draft.radiusKm);
  }, [draft.center, draft.radiusKm, draft.shapeType, draft.provinceId]);

  useEffect(() => {
    centerRef.current = liveCenter;
  }, [liveCenter]);

  const stopInteraction = () => {
    if (modeRef.current === 'idle') return;
    modeRef.current = 'idle';
    onMovingChange(false);
    onResizingChange(false);
    skipClickRef.current = true;
    map.dragging.enable();
  };

  const startMove = (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e.originalEvent);
    L.DomEvent.preventDefault(e.originalEvent);
    onGeometryInteractionStart?.();
    modeRef.current = 'move';
    onMovingChange(true);
    onResizingChange(false);
    map.dragging.disable();
  };

  const startResize = (e: L.LeafletMouseEvent) => {
    L.DomEvent.stopPropagation(e.originalEvent);
    L.DomEvent.preventDefault(e.originalEvent);
    onGeometryInteractionStart?.();
    modeRef.current = 'resize';
    onResizingChange(true);
    onMovingChange(false);
    map.dragging.disable();
    const km = radiusKmFromPointer(
      map,
      centerRef.current,
      e.latlng,
      draft.shapeType
    );
    setLiveRadiusKm(km);
    onRadiusChange(km);
  };

  useMapEvents({
    mousemove(e) {
      if (modeRef.current === 'move') {
        const next: LatLng = [e.latlng.lat, e.latlng.lng];
        centerRef.current = next;
        setLiveCenter(next);
        onCenterChange(next);
        return;
      }
      if (modeRef.current === 'resize') {
        const km = radiusKmFromPointer(
          map,
          centerRef.current,
          e.latlng,
          draft.shapeType
        );
        setLiveRadiusKm(km);
        onRadiusChange(km);
      }
    },
    mouseup: stopInteraction,
  });

  useEffect(() => {
    window.addEventListener('mouseup', stopInteraction);
    return () => window.removeEventListener('mouseup', stopInteraction);
  });

  if (draft.shapeType === 'gouvernorat') {
    return (
      <GeofenceShape
        center={draft.center}
        radiusKm={draft.radiusKm}
        shapeType="gouvernorat"
        provinceId={draft.provinceId}
        preview
        interactive={false}
      />
    );
  }

  const handlePos = resizeHandlePosition(
    liveCenter,
    liveRadiusKm,
    draft.shapeType
  );

  return (
    <>
      <GeofenceShape
        center={liveCenter}
        radiusKm={liveRadiusKm}
        shapeType={draft.shapeType}
        preview
        interactive
        onMouseDown={startResize}
      />
      <Marker
        position={liveCenter}
        draggable={false}
        zIndexOffset={600}
        icon={L.divIcon({
          className: 'gf-draft-center',
          html: `<div style="
            width:14px;height:14px;background:#3b82f6;border:2px solid white;
            border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.4);
            cursor:grab;
          " title="Glisser pour déplacer"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        })}
        eventHandlers={{
          mousedown: startMove,
        }}
      />
      <Marker
        position={handlePos}
        draggable={false}
        zIndexOffset={500}
        icon={L.divIcon({
          className: 'gf-resize-handle',
          html: `<div style="
            width:16px;height:16px;border-radius:50%;
            background:#3b82f6;border:3px solid white;
            box-shadow:0 2px 6px rgba(0,0,0,.35);
            cursor:nesw-resize;
          " title="Glisser pour ajuster le rayon"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })}
        eventHandlers={{
          mousedown: startResize,
        }}
      />
    </>
  );
}

function createVehicleIcon(
  vehicle: Vehicle,
  isSelected: boolean,
  hasCriticalAlert: boolean
) {
  const box = FLEETIQ_MARKER_BOX;
  return L.divIcon({
    className: 'custom-marker',
    html: fleetiqMarkerHtml({
      type: toFleetiqType(vehicle.iconType),
      status: toFleetiqStatus(vehicle.status, hasCriticalAlert),
      heading: vehicle.heading,
      selected: isSelected,
    }),
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    popupAnchor: [0, -box / 2],
  });
}

function createLocationIcon() {
  return L.divIcon({
    className: 'location-marker',
    html: `<div style="
      width:24px;height:24px;border-radius:50% 50% 50% 0;
      background:#3b82f6;border:2px solid white;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,.3);
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });
}

function clusterIconSize(count: number): number {
  if (count < 10) return 36;
  if (count < 50) return 42;
  return 48;
}

function createVehicleClusterIcon(count: number) {
  const size = clusterIconSize(count);
  return L.divIcon({
    className: 'vehicle-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${FIQ.navy};border:3px solid white;
      box-shadow:0 0 0 3px ${FIQ.blue}55, 0 6px 16px rgba(15,27,61,.3);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      color:white;font-weight:800;font-size:${size < 42 ? 11 : 13}px;line-height:1.1;
      font-family:'Plus Jakarta Sans',system-ui,sans-serif;
    ">
      <span style="font-size:9px;opacity:.9;letter-spacing:.02em">V</span>
      <span>${count}</span>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createLocationClusterIcon(count: number) {
  const size = clusterIconSize(count);
  return L.divIcon({
    className: 'location-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;
      border-radius:30% 30% 30% 0;
      transform:rotate(-45deg);
      background:#2563eb;border:3px solid white;
      box-shadow:0 3px 10px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;
    ">
      <div style="
        transform:rotate(45deg);
        color:white;font-weight:700;font-size:${size < 42 ? 11 : 13}px;line-height:1.1;
        text-align:center;font-family:system-ui,sans-serif;
      ">
        <div style="font-size:9px;opacity:.9">E</div>
        <div>${count}</div>
      </div>
    </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function GeofenceShape({
  center,
  radiusKm,
  shapeType,
  provinceId,
  preview,
  interactive = true,
  selected = false,
  onMouseDown,
  onSelect,
}: {
  center: LatLng;
  radiusKm: number;
  shapeType: GeofenceShapeType;
  provinceId?: string;
  preview?: boolean;
  interactive?: boolean;
  selected?: boolean;
  onMouseDown?: (e: L.LeafletMouseEvent) => void;
  onSelect?: (e: L.LeafletMouseEvent) => void;
}) {
  const pathOpts = {
    color: selected ? '#1d4ed8' : preview ? '#3b82f6' : '#6366f1',
    fillColor: selected ? '#3b82f6' : preview ? '#3b82f6' : '#6366f1',
    fillOpacity: selected ? 0.28 : preview ? 0.15 : 0.2,
    weight: selected ? 3 : 2,
    dashArray: preview ? '6 4' : undefined,
    interactive,
  };
  const selectHandlers = onSelect
    ? {
        click: (e: L.LeafletMouseEvent) => {
          L.DomEvent.stopPropagation(e.originalEvent);
          onSelect(e);
        },
        mouseover: (e: L.LeafletMouseEvent) => {
          const el = (e.target as L.Path).getElement();
          if (el) (el as SVGElement).style.cursor = 'pointer';
        },
      }
    : undefined;
  const resizeHandlers = onMouseDown
    ? {
        mousedown: onMouseDown,
        mouseover: (e: L.LeafletMouseEvent) => {
          const el = (e.target as L.Path).getElement();
          if (el) (el as SVGElement).style.cursor = 'nesw-resize';
        },
      }
    : undefined;
  const eventHandlers = onMouseDown ? resizeHandlers : selectHandlers;

  if (shapeType === 'gouvernorat') {
    const province = provinceId
      ? getTunisiaProvince(provinceId)
      : undefined;
    if (!province) return null;
    return (
      <Polygon
        positions={province.points}
        pathOptions={pathOpts}
        eventHandlers={eventHandlers}
      />
    );
  }

  if (shapeType === 'circulaire') {
    return (
      <Circle
        center={center}
        radius={radiusKm * 1000}
        pathOptions={pathOpts}
        eventHandlers={eventHandlers}
      />
    );
  }
  const bounds = rectangleBoundsFromCenter(center, radiusKm);
  return (
    <Rectangle
      bounds={bounds}
      pathOptions={pathOpts}
      eventHandlers={eventHandlers}
    />
  );
}

interface MapViewProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onDeselectVehicle?: () => void;
  mapCenter?: [number, number] | null;
  onMapCenterChange?: () => void;
  basemap?: BasemapType;
  drawMode?: DrawMode;
  onMapClick?: (latlng: LatLng) => void;
  geofences?: GeofenceOverlay[];
  locations?: LocationOverlay[];
  routes?: RouteOverlay[];
  polygons?: PolygonOverlay[];
  defaultZones?: DefaultZoneOverlay[];
  highlightedZoneId?: string | null;
  geofenceDraft?: GeofenceDraft | null;
  onGeofenceRadiusChange?: (km: number) => void;
  onGeofenceCenterChange?: (center: LatLng) => void;
  onGeofencePlaceStart?: (center: LatLng, radiusKm?: number) => void;
  onGeofencePlaceProgress?: (center: LatLng, radiusKm: number) => void;
  onGeofencePlaceEnd?: () => void;
  onGeofenceGeometryInteractionStart?: () => void;
  pendingPoints?: LatLng[];
  onPendingPointsChange?: (points: LatLng[]) => void;
  onFinishPolygon?: () => void;
  /** Create or edit geometry mode for pending overlays */
  activeGeometryMode?: 'polygon' | 'route' | null;
  /** Hide saved overlay while its geometry is being edited */
  editingOverlayId?: string | null;
  /** Allow map clicks even when not in draw mode (e.g. reposition location form) */
  mapClickEnabled?: boolean;
  /** Draft location pin while create/edit form is open */
  draftLocationPosition?: LatLng | null;
  routePreview?: {
    geometry: LatLng[];
    waypoints?: LatLng[];
    distanceMeters?: number;
    durationSeconds?: number;
  } | null;
  overlayFormDraft?: {
    kind: 'polygon' | 'route';
    points: LatLng[];
  } | null;
  clusterVehicles?: boolean;
  clusterLocations?: boolean;
  flyToTarget?: LatLng | null;
  flyToZoom?: number | null;
  onFlyToDone?: () => void;
  fitBoundsPoints?: LatLng[] | null;
  onFitBoundsDone?: () => void;
  /** Explicit zoom when using mapCenter (default 16) */
  mapCenterZoom?: number | null;
  /** Optional GPS track preview (trajectory) */
  trackingPath?: LatLng[] | null;
  onOverlaySelect?: (target: {
    kind: 'geofence' | 'polygon' | 'defaultZone';
    id: string;
  }) => void;
  selectedOverlayId?: string | null;
  geofenceDraftInteractive?: boolean;
  legendHidden?: boolean;
  /** Whole fleet (unfiltered) — used to share alert state with the Alerts module */
  fleetVehicles?: Vehicle[];
  /** Cross-module actions offered by the vehicle card */
  vehicleCardActions?: VehicleCardActions;
  /** Animated replay of a trip (vehicle drives along the real road) */
  tripReplay?: TripReplayRequest | null;
  onCloseTripReplay?: () => void;
}

export function MapView({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onDeselectVehicle,
  mapCenter = null,
  onMapCenterChange = () => {},
  basemap = 'osm',
  drawMode = null,
  onMapClick = () => {},
  geofences = [],
  locations = [],
  routes = [],
  polygons = [],
  defaultZones = [],
  highlightedZoneId = null,
  geofenceDraft = null,
  onGeofenceRadiusChange = () => {},
  onGeofenceCenterChange = () => {},
  onGeofencePlaceStart = () => {},
  onGeofencePlaceProgress = () => {},
  onGeofencePlaceEnd = () => {},
  onGeofenceGeometryInteractionStart,
  pendingPoints = [],
  onPendingPointsChange,
  onFinishPolygon,
  activeGeometryMode = null,
  editingOverlayId = null,
  mapClickEnabled = false,
  draftLocationPosition = null,
  routePreview = null,
  overlayFormDraft = null,
  clusterVehicles = true,
  clusterLocations = false,
  flyToTarget = null,
  flyToZoom = null,
  onFlyToDone = () => {},
  fitBoundsPoints = null,
  onFitBoundsDone = () => {},
  mapCenterZoom = 16,
  trackingPath = null,
  onOverlaySelect,
  selectedOverlayId = null,
  geofenceDraftInteractive = true,
  legendHidden = false,
  fleetVehicles,
  vehicleCardActions,
  tripReplay = null,
  onCloseTripReplay = () => {},
}: MapViewProps) {
  // While a trip is replayed, its vehicle is drawn by the replay layer instead
  const shownVehicles = tripReplay
    ? vehicles.filter((v) => v.id !== tripReplay.vehicle.id)
    : vehicles;
  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) || null;
  ensureAlertStore(fleetVehicles ?? vehicles);
  const criticalIds = getCriticalAlertVehicleIds();

  const replayActive = !!tripReplay;
  useEffect(() => {
    if (!selectedVehicleId || !onDeselectVehicle) return;
    // A click that ends a map drag (pan with the hand) must not close the card
    let down: { x: number; y: number } | null = null;
    const onDown = (event: PointerEvent) => {
      down = { x: event.clientX, y: event.clientY };
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const dragged = down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 5;
      down = null;
      if (dragged) return;
      if (
        target.closest(
          '.leaflet-vehicle-info-popup, .custom-marker, .trip-replay-panel, [data-vehicle-row]'
        )
      ) {
        return;
      }
      // During a trip replay the map stays free to explore: only the card / replay
      // close buttons end it, not a click on the map.
      if (replayActive && target.closest('.leaflet-container')) return;
      onDeselectVehicle();
    };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('click', onClick, true);
    };
  }, [selectedVehicleId, onDeselectVehicle, replayActive]);
  const tile = BASEMAP_TILES[basemap];
  const visibleLocations = locations.filter(
    (l) => l.visible && l.id !== editingOverlayId
  );
  const skipClickRef = useRef(false);
  const [isResizingGeofence, setIsResizingGeofence] = useState(false);
  const [isMovingGeofence, setIsMovingGeofence] = useState(false);
  const [polygonCursor, setPolygonCursor] = useState<LatLng | null>(null);
  const isGeofenceInteracting = isResizingGeofence || isMovingGeofence;

  const geometryMode = activeGeometryMode ?? (
    drawMode === 'polygon' || drawMode === 'route' ? drawMode : null
  );
  const mapBusy =
    !!drawMode ||
    !!geometryMode ||
    (!!geofenceDraft && geofenceDraftInteractive);

  const handleOverlaySelect = (
    kind: 'geofence' | 'polygon' | 'defaultZone',
    id: string
  ) => {
    if (mapBusy || !onOverlaySelect) return;
    onOverlaySelect({ kind, id });
  };

  const polygonPreviewPositions =
    geometryMode === 'polygon' && pendingPoints.length >= 1 && polygonCursor
      ? [...pendingPoints, polygonCursor]
      : pendingPoints;

  return (
    <div className="w-full h-full relative z-0 bg-slate-100">
      <MapContainer
        center={[36.8065, 10.1815]}
        zoom={8}
        style={{ height: '100%', width: '100%', background: '#f1f5f9' }}
        zoomControl={false}
      >
        <TileLayer
          key={basemap}
          attribution={tile.attribution}
          url={tile.url}
        />

        <MapController
          selectedVehicle={selectedVehicle}
          mapCenter={mapCenter}
          mapCenterZoom={mapCenterZoom}
          onMapCenterChange={onMapCenterChange}
          flyToTarget={flyToTarget}
          flyToZoom={flyToZoom}
          onFlyToDone={onFlyToDone}
          fitBoundsPoints={fitBoundsPoints}
          onFitBoundsDone={onFitBoundsDone}
        />
        <MapClickHandler
          enabled={
            mapClickEnabled ||
            !!geometryMode ||
            (!!drawMode &&
              drawMode !== 'geofence' &&
              !isGeofenceInteracting)
          }
          onMapClick={onMapClick}
          skipClickRef={skipClickRef}
          pendingPoints={pendingPoints}
          drawMode={geometryMode ?? drawMode}
          onFinishPolygon={
            // Snap-close only during create, not while editing from Manage
            editingOverlayId ? undefined : onFinishPolygon
          }
        />
        <PolygonCursorTracker
          enabled={geometryMode === 'polygon' && pendingPoints.length > 0}
          onCursor={setPolygonCursor}
        />
        <GeofencePlaceHandler
          enabled={drawMode === 'geofence' && !geofenceDraft}
          shapeType={geofenceDraft?.shapeType ?? 'circulaire'}
          onPlaceStart={onGeofencePlaceStart}
          onPlaceProgress={onGeofencePlaceProgress}
          onPlaceEnd={onGeofencePlaceEnd}
          skipClickRef={skipClickRef}
          onResizingChange={setIsResizingGeofence}
        />
        <DrawCursor
          drawMode={drawMode ?? (geometryMode as DrawMode)}
          isResizing={isResizingGeofence}
          isMoving={isMovingGeofence}
        />

        {clusterVehicles && !mapBusy ? (
          <VehicleClusterLayer
            vehicles={shownVehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            drawMode={drawMode}
            criticalIds={criticalIds}
          />
        ) : (
          shownVehicles.map((vehicle) => (
            <Marker
              key={vehicle.id}
              position={vehicle.coordinates}
              interactive={!mapBusy}
              zIndexOffset={selectedVehicleId === vehicle.id ? 1000 : 0}
              icon={createVehicleIcon(
                vehicle,
                selectedVehicleId === vehicle.id,
                criticalIds.has(vehicle.id)
              )}
              eventHandlers={{
                click: () => {
                  if (mapBusy) return;
                  onSelectVehicle(vehicle);
                },
              }}
            >
              <Tooltip direction="top" offset={[0, -32]} opacity={0.95}>
                <span className="text-xs font-semibold">
                  {vehicle.matricule || vehicle.name}
                </span>
              </Tooltip>
            </Marker>
          ))
        )}

        {clusterLocations && !mapBusy ? (
          <LocationClusterLayer locations={visibleLocations} />
        ) : (
          visibleLocations.map((loc) => (
            <Marker
              key={loc.id}
              position={loc.position}
              interactive={!mapBusy}
              icon={createLocationIcon()}
            >
              <Popup>
                <div className="text-sm font-medium">{loc.name}</div>
              </Popup>
            </Marker>
          ))
        )}

        {/* Draft location while form open */}
        {draftLocationPosition && (
          <Marker
            position={draftLocationPosition}
            interactive={false}
            icon={createLocationIcon()}
          />
        )}

        {/* Geofences */}
        {geofences
          .filter((g) => g.visible && g.id !== editingOverlayId)
          .map((g) => (
            <GeofenceShape
              key={g.id}
              center={g.center}
              radiusKm={g.radiusKm}
              shapeType={g.shapeType}
              provinceId={g.provinceId}
              selected={selectedOverlayId === g.id}
              interactive={!mapBusy}
              onSelect={() => handleOverlaySelect('geofence', g.id)}
            />
          ))}

        {/* Draft geofence preview */}
        {geofenceDraft && geofenceDraftInteractive && (
          <GeofenceDraftEditor
            draft={geofenceDraft}
            onCenterChange={onGeofenceCenterChange}
            onRadiusChange={onGeofenceRadiusChange}
            onGeometryInteractionStart={onGeofenceGeometryInteractionStart}
            skipClickRef={skipClickRef}
            onResizingChange={setIsResizingGeofence}
            onMovingChange={setIsMovingGeofence}
          />
        )}

        {/* Default province zones */}
        {defaultZones
          .filter((z) => z.visible)
          .map((z) => {
            const highlighted =
              highlightedZoneId === z.id || selectedOverlayId === z.id;
            return (
              <Polygon
                key={z.id}
                positions={z.points}
                pathOptions={{
                  color: highlighted ? '#d97706' : '#f59e0b',
                  fillColor: highlighted ? '#f59e0b' : '#fbbf24',
                  fillOpacity: highlighted ? 0.28 : 0.14,
                  weight: highlighted ? 3 : 1.5,
                  interactive: !drawMode && !mapBusy,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e.originalEvent);
                    handleOverlaySelect('defaultZone', z.id);
                  },
                }}
              >
                <Popup>
                  <div className="text-sm font-medium">{z.name}</div>
                  <div className="text-xs text-slate-500">Province</div>
                </Popup>
              </Polygon>
            );
          })}

        {/* Vehicle trajectory preview */}
        {trackingPath && trackingPath.length >= 2 && (
          <Fragment>
            <Polyline
              positions={trackingPath}
              pathOptions={{
                color: '#2563eb',
                weight: 5,
                opacity: 0.85,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </Fragment>
        )}

        {/* Routes */}
        {routes
          .filter((r) => r.visible && r.id !== editingOverlayId)
          .map((r) => (
            <Fragment key={r.id}>
              <Polyline
                positions={r.points}
                pathOptions={{ ...ROUTE_CASING, interactive: false }}
              />
              <Polyline
                positions={r.points}
                pathOptions={{ ...ROUTE_LINE, interactive: !mapBusy }}
              >
                <Popup>
                  <div className="text-sm font-medium">{r.name}</div>
                  {(r.distanceMeters != null || r.durationSeconds != null) && (
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatRouteDistance(r.distanceMeters)} ·{' '}
                      {formatRouteDuration(r.durationSeconds)}
                    </div>
                  )}
                </Popup>
              </Polyline>
              {(r.distanceMeters != null || r.durationSeconds != null) && (
                <RouteMetricsBadge
                  geometry={r.points}
                  distanceMeters={r.distanceMeters}
                  durationSeconds={r.durationSeconds}
                />
              )}
            </Fragment>
          ))}

        {/* Polygons */}
        {polygons
          .filter((p) => p.visible && p.id !== editingOverlayId)
          .map((p) => {
            const selected = selectedOverlayId === p.id;
            return (
              <Polygon
                key={p.id}
                positions={p.points}
                pathOptions={{
                  color: selected ? '#5b21b6' : '#7c3aed',
                  fillColor: selected ? '#7c3aed' : '#8b5cf6',
                  fillOpacity: selected ? 0.28 : 0.18,
                  weight: selected ? 3 : 2,
                  interactive: !mapBusy,
                }}
                eventHandlers={{
                  click: (e) => {
                    L.DomEvent.stopPropagation(e.originalEvent);
                    handleOverlaySelect('polygon', p.id);
                  },
                }}
              >
                <Popup>{p.name}</Popup>
              </Polygon>
            );
          })}

        {/* Route via locations preview */}
        {routePreview && routePreview.geometry.length >= 2 && (
          <Polyline
            positions={routePreview.geometry}
            pathOptions={ROUTE_DRAFT}
          />
        )}
        {(routePreview?.waypoints ?? []).map((pt, i) => (
          <Marker
            key={`route-preview-wp-${i}-${pt[0]}-${pt[1]}`}
            position={pt}
            interactive={false}
            icon={L.divIcon({
              className: 'route-preview-wp',
              html: `<div style="width:22px;height:22px;background:${ROUTE_DRAFT.color};color:white;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;font:700 11px/1 system-ui,sans-serif">${i + 1}</div>`,
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            })}
          />
        ))}
        {routePreview &&
          routePreview.geometry.length >= 2 &&
          routePreview.distanceMeters != null && (
            <RouteMetricsBadge
              geometry={routePreview.geometry}
              distanceMeters={routePreview.distanceMeters}
              durationSeconds={routePreview.durationSeconds}
            />
          )}

        {/* Overlay form draft (after finish, before save) */}
        {overlayFormDraft?.kind === 'route' &&
          overlayFormDraft.points.length >= 2 && (
            <Polyline
              positions={overlayFormDraft.points}
              pathOptions={ROUTE_DRAFT}
            />
          )}
        {overlayFormDraft?.kind === 'polygon' &&
          overlayFormDraft.points.length >= 3 && (
            <Polygon
              positions={overlayFormDraft.points}
              pathOptions={POLYGON_DRAFT}
            />
          )}

        {/* Pending draw / edit points */}
        {pendingPoints.map((pt, i) => {
          const isFirst = i === 0 && geometryMode === 'polygon';
          const canClosePolygon =
            isFirst &&
            geometryMode === 'polygon' &&
            pendingPoints.length >= 3 &&
            !!onFinishPolygon;
          const pendingColor =
            geometryMode === 'route' ? ROUTE_DRAFT.color : '#8b5cf6';
          return (
            <Marker
              key={`pending-${i}`}
              position={pt}
              draggable={!!geometryMode && !!onPendingPointsChange}
              eventHandlers={{
                ...(geometryMode && onPendingPointsChange
                  ? {
                      dragend: (e) => {
                        const m = e.target as L.Marker;
                        const { lat, lng } = m.getLatLng();
                        const next = [...pendingPoints];
                        next[i] = [lat, lng];
                        onPendingPointsChange(next);
                      },
                    }
                  : {}),
                ...(canClosePolygon
                  ? {
                      click: () => {
                        skipClickRef.current = true;
                        onFinishPolygon();
                      },
                    }
                  : {}),
              }}
              icon={L.divIcon({
                className: 'pending-pt',
                html: `<div style="width:${isFirst ? 14 : 10}px;height:${isFirst ? 14 : 10}px;background:${pendingColor};border:2px solid white;border-radius:50%;box-shadow:0 0 0 ${isFirst ? 2 : 0}px rgba(139,92,246,0.45)"></div>`,
                iconSize: [isFirst ? 14 : 10, isFirst ? 14 : 10],
                iconAnchor: [isFirst ? 7 : 5, isFirst ? 7 : 5],
              })}
              interactive={!!geometryMode}
            />
          );
        })}
        {pendingPoints.length >= 2 && geometryMode === 'route' && (
          <PendingRoutePreview waypoints={pendingPoints} />
        )}
        {geometryMode === 'polygon' && polygonPreviewPositions.length >= 2 && (
          <Polygon
            positions={
              polygonPreviewPositions.length >= 3
                ? polygonPreviewPositions
                : polygonPreviewPositions
            }
            pathOptions={POLYGON_DRAFT}
          />
        )}
        {geometryMode === 'polygon' &&
          pendingPoints.length >= 1 &&
          polygonCursor && (
            <Polyline
              positions={[
                pendingPoints[pendingPoints.length - 1],
                polygonCursor,
              ]}
              pathOptions={{
                color: '#8b5cf6',
                weight: 2,
                dashArray: '4 4',
                opacity: 0.7,
              }}
            />
          )}
        {/* Closing hint edge */}
        {geometryMode === 'polygon' &&
          pendingPoints.length >= 2 &&
          polygonCursor && (
            <Polyline
              positions={[polygonCursor, pendingPoints[0]]}
              pathOptions={{
                color: '#a78bfa',
                weight: 1.5,
                dashArray: '2 6',
                opacity: 0.5,
              }}
            />
          )}

        {tripReplay && (
          <TripReplayLayer key={tripReplay.key} replay={tripReplay} onClose={onCloseTripReplay} />
        )}

        {selectedVehicle && (
          <SelectedVehiclePopupOverlay
            vehicle={selectedVehicle}
            onClose={() => onDeselectVehicle?.()}
            actions={vehicleCardActions}
          />
        )}
      </MapContainer>

      <div
        className={`absolute bottom-4 left-4 z-10 flex flex-col gap-2 items-start ${
          legendHidden ? 'hidden sm:flex' : ''
        }`}
      >
        <MapLegend />
        <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-md text-xs font-medium text-slate-600">
          Véhicules: {vehicles.length}
        </div>
      </div>
    </div>
  );
}

function VehicleClusterLayer({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  drawMode,
  criticalIds,
}: {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelectVehicle: (v: Vehicle) => void;
  drawMode: DrawMode;
  criticalIds: Set<string>;
}) {
  const criticalKey = Array.from(criticalIds).sort().join(',');
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('vehicleClusters')) {
      map.createPane('vehicleClusters');
      map.getPane('vehicleClusters')!.style.zIndex = '450';
    }

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 55,
      spiderfyOnMaxZoom: true,
      clusterPane: 'vehicleClusters',
      iconCreateFunction: (cluster) =>
        createVehicleClusterIcon(cluster.getChildCount()),
    });

    vehicles.forEach((vehicle) => {
      const isSelected = selectedVehicleId === vehicle.id;
      const marker = L.marker(vehicle.coordinates, {
        icon: createVehicleIcon(vehicle, isSelected, criticalIds.has(vehicle.id)),
        pane: 'vehicleClusters',
        zIndexOffset: isSelected ? 1000 : 0,
      });
      marker.bindTooltip(vehicle.matricule || vehicle.name, {
        direction: 'top',
        offset: [0, -32],
        opacity: 0.95,
      });
      marker.on('click', () => {
        if (!drawMode) onSelectVehicle(vehicle);
      });
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
    // criticalKey stands in for criticalIds (a new Set each render)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, vehicles, selectedVehicleId, onSelectVehicle, drawMode, criticalKey]);

  return null;
}

function LocationClusterLayer({
  locations,
}: {
  locations: LocationOverlay[];
}) {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane('locationClusters')) {
      map.createPane('locationClusters');
      map.getPane('locationClusters')!.style.zIndex = '460';
    }

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      clusterPane: 'locationClusters',
      iconCreateFunction: (cluster) =>
        createLocationClusterIcon(cluster.getChildCount()),
    });

    locations.forEach((loc) => {
      const marker = L.marker(loc.position, {
        icon: createLocationIcon(),
        pane: 'locationClusters',
      });
      marker.bindPopup(`<div class="text-sm font-medium">${loc.name}</div>`);
      group.addLayer(marker);
    });

    map.addLayer(group);
    return () => {
      map.removeLayer(group);
    };
  }, [map, locations]);

  return null;
}
