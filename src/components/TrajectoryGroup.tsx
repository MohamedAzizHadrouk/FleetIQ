import { useMemo, type ReactNode } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Bookmark,
  BookmarkCheck,
  Car,
  ChevronDown,
  CalendarClock,
  ChevronRight,
  Eye,
  EyeOff,
  Fuel,
  Gauge,
  Hash,
  Info,
  LineChart as LineChartIcon,
  List,
  MapPin,
  Pause,
  Percent,
  Play,
  Timer,
  TrafficCone,
  UserRound,
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

  // One point per sample, enriched with the segment it belongs to (status + address)
  const data = useMemo(() => {
    let si = 0;
    return traj.samples.map((s) => {
      while (si < segments.length - 1 && s.t > segments[si].end.getTime()) si++;
      const seg = segments[si];
      return { t: s.t, speed: s.speed, kind: seg.kind, place: seg.place };
    });
  }, [traj, segments]);

  const pickAt = (t: number | undefined) => {
    if (t == null) return;
    let best = traj.samples[0];
    for (const s of traj.samples) if (Math.abs(s.t - t) < Math.abs(best.t - t)) best = s;
    onPick(best);
  };

  const runMin = traj.summary.runMin;
  const stopMin = traj.summary.stopMin;

  return (
    <tr className="bg-white border-b border-[#E3E9F4]">
      <td colSpan={colCount} className="px-2 pt-3 pb-3">
        <div className="fiq-font" style={pinned(viewportWidth)}>
          {/* Legend + totals */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-1 pb-2">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0F1B3D]">
              <span className="w-3 h-3 rounded-[4px] bg-[#16A34A]" /> Circulation
              <span className="font-semibold text-[#5B6B8C]">· {formatHms(runMin).slice(0, 5)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0F1B3D]">
              <span className="w-3 h-3 rounded-[4px] bg-[#E5484D]" /> Arrêt
              <span className="font-semibold text-[#5B6B8C]">
                · {formatHms(stopMin).slice(0, 5)} · {traj.summary.stops} arrêts
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#0F1B3D]">
              <span className="w-4 h-0.5 rounded bg-[#2F6BFF]" /> Vitesse (km/h)
            </span>
          </div>

          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 18, right: 14, bottom: 0, left: 0 }}
                onClick={(e) => pickAt(e?.activeLabel as number | undefined)}
              >
                <defs>
                  <linearGradient id={`spd-${traj.vehicleId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F6BFF" stopOpacity={0.38} />
                    <stop offset="100%" stopColor="#2F6BFF" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                {/* Status bands: green = circulation, red = stop */}
                {segments.map((g) => (
                  <ReferenceArea
                    key={g.id}
                    x1={g.start.getTime()}
                    x2={g.end.getTime()}
                    fill={g.kind === 'Stop' ? '#E5484D' : '#16A34A'}
                    fillOpacity={g.kind === 'Stop' ? 0.1 : 0.07}
                    ifOverflow="hidden"
                    label={
                      g.kind === 'Stop' && (g.end.getTime() - g.start.getTime()) / span > 0.07
                        ? { value: 'Arrêt', position: 'insideTop', fill: '#9B1C22', fontSize: 11, fontWeight: 800 }
                        : undefined
                    }
                  />
                ))}
                <CartesianGrid stroke="#EEF1F7" vertical={false} />
                <XAxis
                  dataKey="t"
                  type="number"
                  domain={[t0, t1]}
                  scale="time"
                  tickFormatter={fmtTime}
                  tick={{ fontSize: 11, fill: '#5B6B8C' }}
                  axisLine={{ stroke: '#DCE3EF' }}
                  tickLine={false}
                  minTickGap={44}
                />
                <YAxis
                  dataKey="speed"
                  tick={{ fontSize: 11, fill: '#5B6B8C' }}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                  unit=" km/h"
                  domain={[0, (max: number) => Math.max(60, Math.ceil(max / 20) * 20)]}
                />
                <Tooltip
                  cursor={{ stroke: '#0F1B3D', strokeDasharray: '3 3' }}
                  wrapperStyle={{ outline: 'none', zIndex: 20 }}
                  content={({ active, payload }) => {
                    const p = active && payload && payload.length ? (payload[0].payload as (typeof data)[number]) : null;
                    if (!p) return null;
                    const isStop = p.kind === 'Stop' || p.speed === 0;
                    return (
                      <div className="fiq-font w-[240px] rounded-2xl bg-white border border-[#E3E9F4] shadow-[0_14px_32px_rgba(15,27,61,0.18)] p-3 text-[#0F1B3D]">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11.5px] font-extrabold mb-2"
                          style={isStop ? { background: '#FDECEC', color: '#9B1C22' } : { background: '#DCFCE7', color: '#166534' }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: isStop ? '#E5484D' : '#16A34A' }} />
                          {isStop ? 'Arrêt' : 'Circulation'}
                        </span>
                        <div className="flex flex-col gap-1 text-[12px]">
                          <TipLine icon={<CalendarClock className="w-3.5 h-3.5" />} label="Date / heure" value={fmtDateTime(p.t)} />
                          <TipLine icon={<Gauge className="w-3.5 h-3.5" />} label="Vitesse" value={`${p.speed} km/h`} />
                          <TipLine icon={<UserRound className="w-3.5 h-3.5" />} label="Chauffeur" value={vehicle.driver || '—'} />
                        </div>
                        <div className="mt-2 pt-2 border-t border-[#EEF1F7] flex items-start gap-1.5 text-[11.5px] text-[#5B6B8C] leading-snug">
                          <MapPin className="w-3.5 h-3.5 mt-px shrink-0 text-[#2F6BFF]" />
                          <span>{p.place}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                {activeT != null && <ReferenceLine x={activeT} stroke="#0F1B3D" strokeWidth={1.5} />}
                <Area
                  type="monotone"
                  dataKey="speed"
                  stroke="#2F6BFF"
                  strokeWidth={2}
                  fill={`url(#spd-${traj.vehicleId})`}
                  isAnimationActive={false}
                  activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: '#2F6BFF' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status timeline aligned with the chart's plot area */}
          <div className="flex h-3 rounded-full overflow-hidden mt-1 ml-[52px] mr-[14px] bg-[#EEF1F7]" aria-label="Chronologie arrêts / circulation">
            {segments.map((g) => {
              const w = ((g.end.getTime() - g.start.getTime()) / span) * 100;
              return (
                <span
                  key={g.id}
                  title={`${g.kind === 'Stop' ? 'Arrêt' : 'Circulation'} · ${fmtTime(g.start.getTime())} → ${fmtTime(g.end.getTime())} · ${formatHms(g.durationMin).slice(0, 5)}`}
                  style={{ width: `${w}%`, background: g.kind === 'Stop' ? '#E5484D' : '#16A34A' }}
                  className="h-full border-r border-white last:border-r-0 cursor-pointer hover:opacity-80"
                  onClick={() => pickAt((g.start.getTime() + g.end.getTime()) / 2)}
                />
              );
            })}
          </div>
          <p className="px-1 pt-1.5 text-[11px] text-[#8A94A6]">
            Survolez la courbe pour voir les détails · cliquez pour afficher la position sur la carte
          </p>
        </div>
      </td>
    </tr>
  );
}

function TipLine({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-6 h-6 rounded-lg bg-[#F0F3F9] text-[#2F6BFF] flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 text-[11.5px] text-[#5B6B8C] whitespace-nowrap">{label}</span>
      <span className="text-[12.5px] font-extrabold tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}
