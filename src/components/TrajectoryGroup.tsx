import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bookmark,
  BookmarkCheck,
  Car,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  Fuel,
  Gauge,
  Hash,
  Info,
  Maximize2,
  LineChart as LineChartIcon,
  List,
  MapPin,
  Pause,
  Percent,
  Play,
  Power,
  Timer,
  TrafficCone,
  UserRound,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { Vehicle } from '@/types';
import { formatHms, type TrajSample, type VehicleTrajectory } from '@/features/fleetiq/trajectory-data';
import { FleetiqVehicleIcon, toFleetiqType } from '@/features/fleetiq/vehicle-sprite';

export type TrajectoryViewMode = 'rows' | 'graph';

/** Keeps group content pinned to the visible part of a horizontally scrolling table */
function pinned(viewportWidth?: number | null): React.CSSProperties | undefined {
  return viewportWidth ? { position: 'sticky', left: 8, width: Math.max(240, viewportWidth - 16) } : undefined;
}

const fmtTime = (t: number) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const fmtDateTime = (t: number) =>
  new Date(t).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
const num = (n: number, d = 1) => n.toLocaleString('fr-FR', { maximumFractionDigits: d, minimumFractionDigits: d });

function HeaderButton({
  label,
  onClick,
  active,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  primary?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`h-7 min-w-7 px-1.5 rounded-lg inline-flex items-center justify-center gap-1 text-[11.5px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF] ${
        primary
          ? active
            ? 'bg-[#0F1B3D] text-white'
            : 'bg-[#2F6BFF] text-white hover:bg-[#2459E0]'
          : active
            ? 'bg-[#EAF1FF] text-[#2F6BFF] ring-1 ring-[#BFD3FF]'
            : 'bg-white text-[#0F1B3D] border border-[#DCE3EF] hover:bg-[#F7F9FF]'
      }`}
    >
      {children}
    </button>
  );
}

export function TrajectoryGroupHeader({
  vehicle,
  traj,
  colCount,
  viewportWidth,
  collapsed,
  onToggleCollapse,
  mode,
  onModeChange,
  detailsOpen,
  onToggleDetails,
  playing,
  onTogglePlay,
  saved,
  onSaveRoute,
  color,
  shownOnMap,
  onToggleShown,
}: {
  vehicle: Vehicle;
  traj: VehicleTrajectory | null;
  colCount: number;
  viewportWidth?: number | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mode: TrajectoryViewMode;
  onModeChange: (m: TrajectoryViewMode) => void;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  playing: boolean;
  onTogglePlay: () => void;
  saved: boolean;
  onSaveRoute: () => void;
  /** Colour of this trajectory on the map */
  color: string;
  shownOnMap: boolean;
  onToggleShown: () => void;
}) {
  const sum = traj?.summary;
  return (
    <tr className="bg-[#F0F5FF] border-y border-[#DCE6FB]">
      <td colSpan={colCount} className="px-2 py-1.5">
        <div className="fiq-font flex items-center gap-2 min-w-0" style={pinned(viewportWidth)}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Déplier' : 'Replier'}
            className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 text-[#2F6BFF]" /> : <ChevronDown className="w-4 h-4 text-[#2F6BFF]" />}
          </button>
          <span className="w-7 h-7 rounded-lg bg-white border border-[#DCE6FB] flex items-center justify-center shrink-0">
            <FleetiqVehicleIcon type={toFleetiqType(vehicle.iconType)} size={22} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#0F1B3D] min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white"
                style={{ background: shownOnMap ? color : '#C9D1E0' }}
                title="Couleur du trajet sur la carte"
              />
              <span className="truncate">{vehicle.matricule || vehicle.name}</span>
            </span>
            {sum && (
              <span className="block text-[11px] text-[#5B6B8C] truncate">
                {traj!.from} → {traj!.to} · {num(sum.distanceKm)} km · {formatHms(sum.runMin).slice(0, 5)} de conduite · {sum.stops} arrêts
              </span>
            )}
          </span>
          {traj && (
            <div className="flex items-center gap-1 shrink-0">
              <HeaderButton
                label={shownOnMap ? 'Masquer le trajet sur la carte' : 'Afficher le trajet sur la carte'}
                onClick={onToggleShown}
                active={!shownOnMap}
              >
                {shownOnMap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </HeaderButton>
              <HeaderButton
                label={playing ? 'Arrêter l’animation' : 'Animer le trajet sur la carte'}
                onClick={onTogglePlay}
                primary
                active={playing}
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                <span className="hidden xl:inline">{playing ? 'Arrêter' : 'Animer'}</span>
              </HeaderButton>
              <div className="flex p-0.5 rounded-lg bg-white border border-[#DCE3EF]" role="group" aria-label="Affichage">
                {(
                  [
                    ['rows', 'Mode lignes', List],
                    ['graph', 'Mode graphique (vitesse)', LineChartIcon],
                  ] as const
                ).map(([m, label, Icon]) => (
                  <button
                    key={m}
                    type="button"
                    title={label}
                    aria-label={label}
                    aria-pressed={mode === m}
                    onClick={(e) => {
                      e.stopPropagation();
                      onModeChange(m);
                    }}
                    className={`w-6 h-6 rounded-md flex items-center justify-center ${
                      mode === m ? 'bg-[#2F6BFF] text-white' : 'text-[#5B6B8C] hover:text-[#0F1B3D]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <HeaderButton label="Détails du trajet" onClick={onToggleDetails} active={detailsOpen}>
                <Info className="w-3.5 h-3.5" />
              </HeaderButton>
              <HeaderButton label={saved ? 'Enregistré comme route' : 'Enregistrer comme route'} onClick={onSaveRoute} active={saved}>
                {saved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </HeaderButton>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export function TrajectoryDetailsRow({
  vehicle,
  traj,
  colCount,
  viewportWidth,
}: {
  vehicle: Vehicle;
  traj: VehicleTrajectory;
  colCount: number;
  viewportWidth?: number | null;
}) {
  const s = traj.summary;
  const items: { icon: typeof Car; label: string; value: string }[] = [
    { icon: Car, label: 'Véhicule', value: vehicle.matricule || vehicle.name },
    { icon: MapPin, label: 'Distance parcourue', value: `${num(s.distanceKm, 3)} km` },
    { icon: UserRound, label: 'Chauffeur', value: s.driver || '—' },
    { icon: TrafficCone, label: 'Durée de stop', value: formatHms(s.stopMin) },
    { icon: Timer, label: 'Temps de conduite', value: formatHms(s.runMin) },
    { icon: Hash, label: 'Nombre d’arrêts', value: String(s.stops) },
    { icon: Percent, label: 'Taux de trafic', value: `${num(s.trafficRate, 3)} %` },
    { icon: Fuel, label: 'Consommation moyenne réelle', value: `${num(s.avgConsumption)} L/100 km` },
    { icon: Fuel, label: 'Carburant total consommé', value: `${num(s.totalFuel, 2)} L` },
    { icon: Gauge, label: 'Vitesse maximale', value: `${s.maxSpeed} km/h` },
    { icon: Gauge, label: 'Vitesse moyenne', value: `${s.avgSpeed} km/h` },
  ];
  return (
    <tr className="bg-white border-b border-[#E3E9F4]">
      <td colSpan={colCount} className="px-3 py-3">
        <div className="fiq-font" style={pinned(viewportWidth)}>
          <p className="text-[11px] font-extrabold text-[#5B6B8C] uppercase tracking-[0.04em] mb-2">
            Détails du trajet · {fmtDateTime(traj.start.getTime())} → {fmtDateTime(traj.end.getTime())}
          </p>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))' }}>
            {items.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#F7F9FF] border border-[#E3E9F4] min-w-0">
                <span className="w-7 h-7 rounded-lg bg-white border border-[#DCE6FB] flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#2F6BFF]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] text-[#5B6B8C] truncate">{label}</span>
                  <span className="block text-[13px] font-extrabold text-[#0F1B3D] tabular-nums truncate">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

const PLOT_LEFT = 34;
const PLOT_RIGHT = 14;
const MIN_WINDOW_MS = 2 * 60_000;
const STOP_PATH = 'M-4.3 -10.4h8.6l6.1 6.1v8.6l-6.1 6.1h-8.6l-6.1-6.1v-8.6z';

/** Red STOP octagon drawn on the chart (same glyph as the map's stop markers) */
function StopGlyph({ cx, cy, n, active }: { cx: number; cy: number; n: number; active: boolean }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${active ? 1.15 : 1})`} style={{ filter: 'drop-shadow(0 2px 3px rgba(15,27,61,.3))' }}>
      <line x1={0} y1={11} x2={0} y2={17} stroke="#E5484D" strokeWidth={1.5} />
      <path d={STOP_PATH} fill="#E5484D" stroke="#fff" strokeWidth={1.6} />
      <text y={-1.4} textAnchor="middle" fontSize={5.4} fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans,Arial,sans-serif">
        STOP
      </text>
      <text y={5.8} textAnchor="middle" fontSize={6.2} fontWeight={800} fill="#fff" fontFamily="Plus Jakarta Sans,Arial,sans-serif">
        {n}
      </text>
    </g>
  );
}

/** Green power badge: ignition switched on (start of a circulation) */
function ContactOnGlyph({ cx, cy, active }: { cx: number; cy: number; active: boolean }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${active ? 1.15 : 1})`} style={{ filter: 'drop-shadow(0 2px 3px rgba(15,27,61,.3))' }}>
      <line x1={0} y1={11} x2={0} y2={17} stroke="#16A34A" strokeWidth={1.5} />
      <circle r={10.4} fill="#16A34A" stroke="#fff" strokeWidth={1.6} />
      <path d="M-3.9 -3.1a5.2 5.2 0 1 0 7.8 0" fill="none" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
      <line x1={0} y1={-5.6} x2={0} y2={-0.6} stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
    </g>
  );
}

function ZoomButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0F1B3D] hover:bg-[#F0F3F9] disabled:opacity-35 disabled:hover:bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BFF]"
    >
      {children}
    </button>
  );
}

export function TrajectoryGraphRow({
  vehicle,
  traj,
  colCount,
  viewportWidth,
  activeT,
  onPick,
}: {
  vehicle: Vehicle;
  traj: VehicleTrajectory;
  colCount: number;
  viewportWidth?: number | null;
  activeT: number | null;
  onPick: (sample: TrajSample) => void;
}) {
  const segments = traj.segments;
  const t0 = traj.start.getTime();
  const t1 = traj.end.getTime();
  const span = Math.max(1, t1 - t0);

  // Visible time window (zoom). null = whole trip
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [z0, z1] = zoom ?? [t0, t1];
  const winSpan = Math.max(1, z1 - z0);
  const zoomFactor = span / winSpan;

  // Drag-to-zoom selection on the chart
  const [selA, setSelA] = useState<number | null>(null);
  const [selB, setSelB] = useState<number | null>(null);
  const [hoverStop, setHoverStop] = useState<string | null>(null);
  // Refs mirror the selection so mouse handlers never read a stale value
  const selARef = useRef<number | null>(null);
  const selBRef = useRef<number | null>(null);

  const chartRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState(0);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setChartW(el.clientWidth));
    ro.observe(el);
    setChartW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const plotW = Math.max(1, chartW - PLOT_LEFT - PLOT_RIGHT);

  /** Keeps a window inside the trip and above the minimum width (null = whole trip) */
  const clampWindow = useCallback(
    (a: number, b: number): [number, number] | null => {
      const w = Math.max(MIN_WINDOW_MS, b - a);
      if (w >= span) return null;
      const start = Math.max(t0, Math.min(a, t1 - w));
      return [start, start + w];
    },
    [span, t0, t1]
  );

  const zoomAround = useCallback(
    (center: number, factor: number) => {
      setZoom((prev) => {
        const [a, b] = prev ?? [t0, t1];
        const w = (b - a) / factor;
        const ratio = (center - a) / Math.max(1, b - a);
        return clampWindow(center - w * ratio, center - w * ratio + w);
      });
    },
    [clampWindow, t0, t1]
  );

  const panBy = useCallback(
    (deltaMs: number) => setZoom((prev) => (prev ? clampWindow(prev[0] + deltaMs, prev[1] + deltaMs) : prev)),
    [clampWindow]
  );

  // Mouse wheel zooms around the cursor; Shift + wheel (or a horizontal wheel) pans.
  // Wheeling out of the whole trip lets the table scroll normally.
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      const frac = Math.min(1, Math.max(0, (e.clientX - rect.left - PLOT_LEFT) / Math.max(1, rect.width - PLOT_LEFT - PLOT_RIGHT)));
      const [a, b] = zoomRef.current ?? [t0, t1];
      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (!zoomRef.current) return;
        e.preventDefault();
        const d = e.shiftKey ? e.deltaY || e.deltaX : e.deltaX;
        panBy((d / Math.max(1, rect.width)) * (b - a));
        return;
      }
      if (e.deltaY === 0) return;
      if (e.deltaY > 0 && !zoomRef.current) return; // already showing the whole trip
      e.preventDefault();
      zoomAround(a + frac * (b - a), e.deltaY < 0 ? 1.3 : 1 / 1.3);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [zoomAround, panBy, t0, t1]);

  // One point per sample, enriched with the segment it belongs to (status + address)
  const data = useMemo(() => {
    let si = 0;
    return traj.samples.map((s) => {
      while (si < segments.length - 1 && s.t > segments[si].end.getTime()) si++;
      const seg = segments[si];
      return { t: s.t, speed: s.speed, kind: seg.kind, place: seg.place };
    });
  }, [traj, segments]);

  // Only the points of the visible window (+ one on each side so the curve reaches the edges)
  const visibleData = useMemo(() => {
    if (!zoom) return data;
    let i0 = data.findIndex((d) => d.t >= z0);
    if (i0 < 0) i0 = data.length - 1;
    let i1 = data.length - 1;
    for (let i = i0; i < data.length; i++) {
      if (data[i].t > z1) {
        i1 = i;
        break;
      }
    }
    return data.slice(Math.max(0, i0 - 1), i1 + 1);
  }, [data, zoom, z0, z1]);

  const maxSpeed = useMemo(() => data.reduce((m, d) => Math.max(m, d.speed), 0), [data]);
  const yTop = Math.max(60, Math.ceil(maxSpeed / 20) * 20);

  const stops = useMemo(
    () =>
      segments
        .filter((g) => g.kind === 'Stop')
        .map((g, i) => ({ seg: g, n: i + 1, a: g.start.getTime(), b: g.end.getTime() })),
    [segments]
  );

  /** Ignition events: contact OFF when the vehicle stops, contact ON when it drives off again */
  const contactEvents = useMemo(() => {
    let off = 0;
    let on = 0;
    return segments.map((g, i) => {
      const isOff = g.kind === 'Stop';
      const n = isOff ? ++off : ++on;
      return {
        key: `${isOff ? 'off' : 'on'}-${n}`,
        kind: (isOff ? 'off' : 'on') as 'off' | 'on',
        n,
        t: g.start.getTime(),
        seg: g,
        // Contact ON happens where the previous stop was (or at the departure)
        place: isOff ? g.place : segments[i - 1]?.place ?? traj.from,
      };
    });
  }, [segments, traj.from]);

  const pickAt = (t: number | undefined) => {
    if (t == null) return;
    let best = traj.samples[0];
    for (const s of traj.samples) if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
    onPick(best);
  };

  const finishSelection = () => {
    const a = selARef.current;
    const b = selBRef.current;
    if (a != null && b != null && Math.abs(b - a) / winSpan > 0.02) {
      setZoom(clampWindow(Math.min(a, b), Math.max(a, b)));
    } else if (a != null) {
      pickAt(a);
    }
    selARef.current = null;
    selBRef.current = null;
    setSelA(null);
    setSelB(null);
  };

  const fineTicks = winSpan < 20 * 60_000;
  const tickFmt = (t: number) =>
    new Date(t).toLocaleTimeString(
      'fr-FR',
      fineTicks ? { hour: '2-digit', minute: '2-digit', second: '2-digit' } : { hour: '2-digit', minute: '2-digit' }
    );

  /** Visible middle of a stop (where its duration is written) */
  const stopX = (s: { a: number; b: number }) => (Math.max(s.a, z0) + Math.min(s.b, z1)) / 2;
  const pxOf = (t: number) => PLOT_LEFT + ((t - z0) / winSpan) * plotW;

  // Visible contact markers; one that would overlap its neighbour drops to a second row
  const visibleEvents = useMemo(() => {
    const out: ((typeof contactEvents)[number] & { row: number })[] = [];
    let lastPx = -Infinity;
    let lastRow = 1;
    for (const ev of contactEvents) {
      if (ev.t < z0 || ev.t > z1) continue;
      const px = PLOT_LEFT + ((ev.t - z0) / winSpan) * plotW;
      const row = px - lastPx < 26 && lastRow === 0 ? 1 : 0;
      out.push({ ...ev, row });
      lastPx = px;
      lastRow = row;
    }
    return out;
  }, [contactEvents, z0, z1, winSpan, plotW]);

  const runMin = traj.summary.runMin;
  const stopMin = traj.summary.stopMin;
  const hovered = hoverStop != null ? contactEvents.find((e) => e.key === hoverStop) : undefined;
  const hoveredX = hovered ? pxOf(hovered.t) : 0;

  // Overview navigator: dragging the visible window pans the chart
  const navRef = useRef<HTMLDivElement>(null);
  const startNavDrag = (e: React.PointerEvent) => {
    if (!zoom || !navRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const width = navRef.current.getBoundingClientRect().width;
    const startX = e.clientX;
    const [a0, b0] = zoom;
    const move = (ev: PointerEvent) => {
      const d = ((ev.clientX - startX) / Math.max(1, width)) * span;
      setZoom(clampWindow(a0 + d, b0 + d));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // Exact point under the cursor: time from the mouse x, speed interpolated between samples
  const [hoverX, setHoverX] = useState<number | null>(null);
  const plotBottom = CHART_H - X_AXIS_H;
  const plotH = plotBottom - PLOT_TOP;
  const yOf = (speed: number) => PLOT_TOP + (1 - Math.min(speed, yTop) / yTop) * plotH;
  const tAtX = (x: number) => z0 + ((x - PLOT_LEFT) / plotW) * winSpan;
  const xFromEvent = (e: React.MouseEvent) => {
    const el = chartRef.current;
    if (!el) return null;
    const x = e.clientX - el.getBoundingClientRect().left;
    return x < PLOT_LEFT || x > PLOT_LEFT + plotW ? null : x;
  };
  const hoverPt = useMemo(() => {
    if (hoverX == null || !data.length) return null;
    const t = tAtX(hoverX);
    let lo = 0;
    let hi = data.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (data[mid].t <= t) lo = mid;
      else hi = mid;
    }
    const a = data[lo];
    const b = data[hi];
    const f = b.t === a.t ? 0 : Math.min(1, Math.max(0, (t - a.t) / (b.t - a.t)));
    const speed = Math.round(a.speed + (b.speed - a.speed) * f);
    const seg = segments.find((g) => t >= g.start.getTime() && t <= g.end.getTime());
    return { t, speed, kind: seg?.kind ?? (f < 0.5 ? a.kind : b.kind), place: seg?.place ?? (f < 0.5 ? a.place : b.place) };
  }, [hoverX, data, segments, z0, winSpan, plotW]);
  const showPointTip = hoverPt && !hovered && selB == null;

  return (
    <tr className="bg-white border-b border-[#E3E9F4]">
      <td colSpan={colCount} className="px-2 pt-3 pb-3">
        <div className="fiq-font" style={pinned(viewportWidth)}>
          <div className="rounded-2xl border border-[#EEF1F7] bg-white px-4 pt-3 pb-3">
            {/* Title, legend and zoom controls */}
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-[13px] font-bold text-[#0F1B3D] mr-2">Profil de vitesse</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[#5B6B8C]">
                <LegendItem color="#22A35A" label="Circulation" value={formatHms(runMin).slice(0, 5)} />
                <LegendItem color="#E5737A" label={`Arrêts (${traj.summary.stops})`} value={formatHms(stopMin).slice(0, 5)} />
                <LegendItem color="#2F6BFF" line label="Vitesse max" value={`${traj.summary.maxSpeed} km/h`} />
              </div>
              <div
                className="ml-auto flex items-center gap-0.5"
                role="group"
                aria-label="Zoom du graphique"
              >
                <ZoomButton label="Dézoomer" onClick={() => zoomAround((z0 + z1) / 2, 1 / 1.6)} disabled={!zoom}>
                  <ZoomOut className="w-3.5 h-3.5" />
                </ZoomButton>
                <span className="min-w-[38px] text-center text-[11.5px] font-semibold tabular-nums text-[#5B6B8C]" aria-live="polite">
                  ×{num(zoomFactor, zoomFactor < 10 ? 1 : 0)}
                </span>
                <ZoomButton label="Zoomer" onClick={() => zoomAround((z0 + z1) / 2, 1.6)} disabled={winSpan <= MIN_WINDOW_MS + 1}>
                  <ZoomIn className="w-3.5 h-3.5" />
                </ZoomButton>
                
                <ZoomButton label="Réinitialiser le zoom" onClick={() => setZoom(null)} disabled={!zoom}>
                  <Maximize2 className="w-3.5 h-3.5" />
                </ZoomButton>
              </div>
            </div>

            <div
              ref={chartRef}
              className="relative select-none"
              onMouseLeave={() => {
                setHoverStop(null);
                setHoverX(null);
                if (selARef.current != null) finishSelection();
              }}
              onMouseDown={(e) => {
                const x = xFromEvent(e);
                if (x == null || e.button !== 0) return;
                selARef.current = tAtX(x);
                selBRef.current = null;
                setSelA(selARef.current);
                setSelB(null);
              }}
              onMouseMove={(e) => {
                const x = xFromEvent(e);
                setHoverX(x);
                if (selARef.current != null && x != null) {
                  selBRef.current = tAtX(x);
                  setSelB(selBRef.current);
                }
              }}
              onMouseUp={finishSelection}
              style={{ height: CHART_H, cursor: selA != null ? 'col-resize' : 'crosshair' }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleData} margin={{ top: PLOT_TOP, right: PLOT_RIGHT, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`spd-${traj.vehicleId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2F6BFF" stopOpacity={0.16} />
                      <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  {/* Status bands: green = circulation, red = stop */}
                  {segments
                    .filter((g) => g.end.getTime() >= z0 && g.start.getTime() <= z1)
                    .map((g) => (
                      <ReferenceArea
                        key={g.id}
                        x1={Math.max(z0, g.start.getTime())}
                        x2={Math.min(z1, g.end.getTime())}
                        fill={g.kind === 'Stop' ? '#E5484D' : '#16A34A'}
                        fillOpacity={g.kind === 'Stop' ? 0.045 : 0.02}
                        ifOverflow="hidden"
                      />
                    ))}
                  <CartesianGrid stroke="#F0F3F8" vertical={false} />
                  <XAxis
                    dataKey="t"
                    type="number"
                    domain={[z0, z1]}
                    allowDataOverflow
                    scale="time"
                    height={X_AXIS_H}
                    tickFormatter={tickFmt}
                    tick={{ fontSize: 11, fill: '#8A94A6', fontWeight: 500 }}
                    axisLine={{ stroke: '#E3E9F4' }}
                    tickLine={false}
                    tickMargin={8}
                    minTickGap={fineTicks ? 60 : 44}
                  />
                  <YAxis
                    dataKey="speed"
                    tick={{ fontSize: 11, fill: '#8A94A6', fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    width={PLOT_LEFT}
                    tickCount={5}
                    domain={[0, yTop]}
                    allowDataOverflow
                  />
                  {activeT != null && activeT >= z0 && activeT <= z1 && (
                    <ReferenceLine x={activeT} stroke="#0F1B3D" strokeWidth={1.5} />
                  )}
                  <Area
                    type="monotone"
                    dataKey="speed"
                    stroke="#2F6BFF"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    fill={`url(#spd-${traj.vehicleId})`}
                    isAnimationActive={false}
                    activeDot={false}
                  />
                  {selA != null && selB != null && (
                    <ReferenceArea
                      x1={Math.min(selA, selB)}
                      x2={Math.max(selA, selB)}
                      fill="#2F6BFF"
                      fillOpacity={0.1}
                      stroke="#2F6BFF"
                      strokeOpacity={0.45}
                      strokeDasharray="4 3"
                    />
                  )}
                  {/* Stop durations: a soft pill in the middle of each wide enough stop */}
                  {stops
                    .filter((st) => st.b >= z0 && st.a <= z1 && ((Math.min(st.b, z1) - Math.max(st.a, z0)) / winSpan) * plotW > 84)
                    .map((st) => {
                      const label = `Arrêt · ${formatHms(st.seg.durationMin).slice(0, 5)}`;
                                            return (
                        <ReferenceDot
                          key={`dur-${st.seg.id}`}
                          x={stopX(st)}
                          y={yTop * 0.5}
                          r={0}
                          ifOverflow="visible"
                          shape={(p: { cx?: number; cy?: number }) => (
                            <text
                              x={p.cx}
                              y={(p.cy ?? 0) + 4}
                              textAnchor="middle"
                              fontSize={11.5}
                              fontWeight={600}
                              fill="#B4545A"
                              fillOpacity={0.85}
                              fontFamily="Plus Jakarta Sans,Arial,sans-serif"
                              style={{ pointerEvents: 'none' }}
                            >
                              {label}
                            </text>
                          )}
                        />
                      );
                    })}
                  {/* Ignition markers: STOP = contact OFF, green power = contact ON */}
                  {visibleEvents.map((ev) => (
                    <ReferenceDot
                      key={ev.key}
                      x={ev.t}
                      y={yTop}
                      r={0}
                      ifOverflow="visible"
                      shape={(p: { cx?: number; cy?: number }) => {
                        const cx = p.cx ?? 0;
                        const cy = (p.cy ?? 0) + MARKER_DY + ev.row * 26;
                        return (
                          <g
                            data-contact-marker={ev.key}
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={() => setHoverStop(ev.key)}
                            onMouseLeave={() => setHoverStop(null)}
                            onMouseDown={(e) => e.stopPropagation()}
                            onMouseUp={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              pickAt(ev.t);
                            }}
                          >
                            {ev.kind === 'off' ? (
                              <StopGlyph cx={cx} cy={cy} n={ev.n} active={hoverStop === ev.key} />
                            ) : (
                              <ContactOnGlyph cx={cx} cy={cy} active={hoverStop === ev.key} />
                            )}
                          </g>
                        );
                      }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>

              {/* Tooltip of the point under the cursor */}
              {hoverPt && selB == null && (
                <>
                  {/* Crosshair + dot exactly under the cursor */}
                  <span
                    className="pointer-events-none absolute z-10 w-0 border-l border-dashed border-[#0F1B3D]/40"
                    style={{ left: pxOf(hoverPt.t), top: PLOT_TOP, height: plotH }}
                  />
                  <span
                    className="pointer-events-none absolute z-10 w-5 h-5 -ml-2.5 -mt-2.5 rounded-full bg-[#2F6BFF]/20 flex items-center justify-center"
                    style={{ left: pxOf(hoverPt.t), top: yOf(hoverPt.speed) }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2F6BFF] ring-2 ring-white" />
                  </span>
                </>
              )}
              {showPointTip && hoverPt && (
                <>
                  <span
                    className="pointer-events-none absolute z-20 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-[#0F1B3D] text-white text-[10.5px] font-bold tabular-nums whitespace-nowrap"
                    style={{ left: pxOf(hoverPt.t), top: plotBottom + 5 }}
                  >
                    {fmtTimeSec(hoverPt.t)}
                  </span>
                  <ChartTip x={pxOf(hoverPt.t)} y={yOf(hoverPt.speed)} chartW={chartW}>
                    <PointTipBody
                      stop={hoverPt.kind === 'Stop' || hoverPt.speed === 0}
                      t={hoverPt.t}
                      speed={hoverPt.speed}
                      driver={vehicle.driver || '—'}
                      place={hoverPt.place}
                    />
                  </ChartTip>
                </>
              )}

              {/* Tooltip of a contact marker */}
              {hovered && (
                <ChartTip
                  x={hoveredX}
                  y={PLOT_TOP + MARKER_DY + (visibleEvents.find((e) => e.key === hovered.key)?.row ?? 0) * 26 + 14}
                  chartW={chartW}
                  forceBelow
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-extrabold"
                      style={
                        hovered.kind === 'off'
                          ? { background: 'rgba(229,72,77,0.22)', color: '#FFB4B6' }
                          : { background: 'rgba(22,163,74,0.24)', color: '#86EFAC' }
                      }
                    >
                      <Power className="w-3 h-3" />
                      {hovered.kind === 'off' ? 'Contact OFF' : 'Contact ON'}
                    </span>
                    {hovered.kind === 'off' && <span className="text-[11px] font-bold text-white/70">Arrêt n° {hovered.n}</span>}
                  </div>
                  {hovered.kind === 'off' ? (
                    <>
                      <TipRow label="Contact coupé" value={fmtDateTime(hovered.seg.start.getTime())} />
                      <TipRow label="Contact remis" value={fmtDateTime(hovered.seg.end.getTime())} />
                      <TipRow label="Durée d’arrêt" value={formatHms(hovered.seg.durationMin)} strong />
                    </>
                  ) : (
                    <>
                      <TipRow label="Démarrage" value={fmtDateTime(hovered.seg.start.getTime())} />
                      <TipRow label="Circulation" value={formatHms(hovered.seg.durationMin)} />
                      <TipRow label="Distance" value={`${num(hovered.seg.distanceKm)} km`} strong />
                    </>
                  )}
                  <TipPlace place={hovered.place} />
                </ChartTip>
              )}
            </div>

            {/* Overview of the whole trip, aligned with the plot area; the frame shows the zoomed window */}
            <div ref={navRef} className="relative mt-2" style={{ marginLeft: PLOT_LEFT, marginRight: PLOT_RIGHT }}>
              <div className="flex gap-[2px] h-1.5" aria-label="Chronologie arrêts / circulation">
                {segments.map((g) => {
                  const w = ((g.end.getTime() - g.start.getTime()) / span) * 100;
                  return (
                    <span
                      key={g.id}
                      title={`${g.kind === 'Stop' ? 'Arrêt' : 'Circulation'} · ${fmtTime(g.start.getTime())} → ${fmtTime(g.end.getTime())} · ${formatHms(g.durationMin).slice(0, 5)}`}
                      style={{ width: `${w}%`, minWidth: 3, background: g.kind === 'Stop' ? '#F2A7AB' : '#7FD3A0' }}
                      className="h-full rounded-full cursor-pointer hover:brightness-90 transition"
                      onClick={() => {
                        const mid = (g.start.getTime() + g.end.getTime()) / 2;
                        pickAt(mid);
                        if (zoom && (mid < z0 || mid > z1)) setZoom(clampWindow(mid - winSpan / 2, mid + winSpan / 2));
                      }}
                    />
                  );
                })}
              </div>
              {zoom && (
                <div
                  role="slider"
                  aria-label="Fenêtre visible du graphique"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(((z0 - t0) / span) * 100)}
                  title="Faites glisser pour vous déplacer dans le trajet"
                  onPointerDown={startNavDrag}
                  className="absolute -top-2.5 -bottom-2.5 rounded-lg border-2 border-[#2F6BFF] bg-[#2F6BFF]/15 shadow-[0_1px_4px_rgba(47,107,255,0.3)] cursor-grab active:cursor-grabbing flex items-center justify-center gap-[3px] hover:bg-[#2F6BFF]/25 transition-colors"
                  style={(() => {
                    // At least 36px wide so it is easy to grab, centred on the visible window
                    const realW = (winSpan / span) * plotW;
                    const w = Math.min(plotW, Math.max(realW, 36));
                    const left = ((z0 - t0) / span) * plotW + realW / 2 - w / 2;
                    return { left: Math.min(Math.max(left, 0), plotW - w), width: w };
                  })()}
                >
                  <span className="w-[2px] h-2.5 rounded-full bg-[#2F6BFF]/70" />
                  <span className="w-[2px] h-2.5 rounded-full bg-[#2F6BFF]/70" />
                </div>
              )}
            </div>
            <p className="pt-2 text-[11px] text-[#A0A9BA]">
              Molette pour zoomer · glisser pour sélectionner une période · clic pour voir la position sur la carte
              {zoom ? ' · faites glisser le cadre bleu pour vous déplacer' : ''}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

const CHART_H = 250;
const PLOT_TOP = 26;
const X_AXIS_H = 28;
/** Contact markers sit just inside the top of the plot */
const MARKER_DY = 2;
const TIP_W = 220;

const fmtTimeSec = (t: number) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

function LegendItem({ color, label, value, line }: { color: string; label: string; value: string; line?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span className={line ? 'w-3 h-[2px] rounded-full' : 'w-2 h-2 rounded-full'} style={{ background: color }} />
      {label}
      <span className="font-semibold tabular-nums text-[#0F1B3D]">{value}</span>
    </span>
  );
}

/** Dark tooltip anchored on a chart point, with an arrow pointing at it */
function ChartTip({
  x,
  y,
  chartW,
  forceBelow,
  children,
}: {
  x: number;
  y: number;
  chartW: number;
  forceBelow?: boolean;
  children: ReactNode;
}) {
  const below = forceBelow || y < 120;
  const left = Math.min(Math.max(x, TIP_W / 2 + 2), Math.max(TIP_W / 2 + 2, chartW - TIP_W / 2 - 2));
  const arrow = Math.min(Math.max(x - left, -TIP_W / 2 + 14), TIP_W / 2 - 14);
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-30"
      style={{
        left,
        top: below ? y + 12 : y - 12,
        width: TIP_W,
        transform: `translate(-50%, ${below ? '0' : '-100%'})`,
      }}
    >
      <div className="relative rounded-xl bg-[#0F1B3D] text-white shadow-[0_12px_28px_rgba(15,27,61,0.32)] px-3 py-2.5">
        {children}
        <span
          className="absolute w-2.5 h-2.5 bg-[#0F1B3D] rotate-45"
          style={{ left: `calc(50% + ${arrow}px - 5px)`, ...(below ? { top: -5 } : { bottom: -5 }) }}
        />
      </div>
    </div>
  );
}

function PointTipBody({ stop, t, speed, driver, place }: { stop: boolean; t: number; speed: number; driver: string; place: string }) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-extrabold"
          style={stop ? { background: 'rgba(229,72,77,0.22)', color: '#FFB4B6' } : { background: 'rgba(22,163,74,0.24)', color: '#86EFAC' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: stop ? '#E5484D' : '#22C55E' }} />
          {stop ? 'Arrêt' : 'Circulation'}
        </span>
        <span className="ml-auto text-[11px] font-semibold text-white/65 tabular-nums">{fmtDateTime(t).replace(' ', ' · ')}</span>
      </div>
      <div className="flex items-baseline gap-1 mt-1.5">
        <span className="text-[20px] leading-none font-extrabold tabular-nums">{speed}</span>
        <span className="text-[11px] font-bold text-white/65">km/h</span>
      </div>
      <TipRow label="Chauffeur" value={driver} />
      <TipPlace place={place} />
    </>
  );
}

function TipRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center gap-2 mt-1 text-[11.5px]">
      <span className="text-white/60 whitespace-nowrap">{label}</span>
      <span className={`ml-auto tabular-nums text-right truncate ${strong ? 'font-extrabold' : 'font-semibold'}`}>{value}</span>
    </div>
  );
}

function TipPlace({ place }: { place: string }) {
  return (
    <div className="mt-2 pt-2 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-white/75 leading-snug">
      <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-[#7FA6FF]" />
      <span className="line-clamp-2">{place}</span>
    </div>
  );
}

/** Stop & Circulation: one header row per vehicle, in the vehicle's map colour */
export function StopRunGroupHeader({
  vehicle,
  traj,
  colCount,
  viewportWidth,
  color,
  collapsed,
  onToggleCollapse,
  shownOnMap,
  onToggleShown,
  onFocus,
  focused = false,
  dimmed = false,
}: {
  vehicle: Vehicle;
  traj: VehicleTrajectory | null;
  colCount: number;
  viewportWidth?: number | null;
  color: string;
  /** This vehicle is shown alone on the map (overall view) */
  focused?: boolean;
  /** Another vehicle is shown alone: this one is off the map for now */
  dimmed?: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  shownOnMap: boolean;
  onToggleShown: () => void;
  onFocus: () => void;
}) {
  const sum = traj?.summary;
  const runs = traj ? traj.segments.filter((g) => g.kind === 'Circulation').length : 0;
  return (
    <tr
      className={`border-y border-[#E3E9F4] transition-opacity ${dimmed ? 'opacity-55' : ''}`}
      style={{ background: focused ? `${color}1F` : `${color}0F` }}
    >
      <td colSpan={colCount} className="px-2 py-1.5" style={{ boxShadow: `inset 4px 0 0 ${color}` }}>
        <div className="fiq-font flex items-center gap-2 min-w-0" style={pinned(viewportWidth)}>
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Déplier' : 'Replier'}
            className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" style={{ color }} /> : <ChevronDown className="w-4 h-4" style={{ color }} />}
          </button>
          <button
            type="button"
            onClick={onFocus}
            title={focused ? 'Revenir à tous les véhicules' : 'Vue globale des arrêts et circulations de ce véhicule'}
            aria-pressed={focused}
            className="flex items-center gap-2 min-w-0 flex-1 text-left rounded-lg hover:bg-white/70 px-1 py-0.5"
          >
            <span className="w-7 h-7 rounded-lg bg-white border flex items-center justify-center shrink-0" style={{ borderColor: `${color}55` }}>
              <FleetiqVehicleIcon type={toFleetiqType(vehicle.iconType)} size={22} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#0F1B3D] min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white" style={{ background: shownOnMap ? color : '#C9D1E0' }} />
                <span className="truncate">{vehicle.matricule || vehicle.name}</span>
                {focused && (
                  <span
                    className="shrink-0 px-1.5 py-px rounded-full text-[10.5px] font-extrabold text-white"
                    style={{ background: color }}
                  >
                    Vue globale
                  </span>
                )}
              </span>
              {sum && (
                <span className="flex items-center gap-2 text-[11px] text-[#5B6B8C] truncate">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-2 h-2 rounded-sm bg-[#E5484D]" />
                    {sum.stops} arrêts · {formatHms(sum.stopMin).slice(0, 5)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-0.5 rounded" style={{ background: color }} />
                    {runs} circulations · {num(sum.distanceKm)} km
                  </span>
                </span>
              )}
            </span>
          </button>
          {focused && (
            <HeaderButton label="Revenir à tous les véhicules" onClick={onFocus}>
              <X className="w-3.5 h-3.5" />
              <span>Tous</span>
            </HeaderButton>
          )}
          <HeaderButton
            label={shownOnMap ? 'Masquer sur la carte' : 'Afficher sur la carte'}
            onClick={onToggleShown}
            active={!shownOnMap}
          >
            {shownOnMap ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </HeaderButton>
        </div>
      </td>
    </tr>
  );
}
