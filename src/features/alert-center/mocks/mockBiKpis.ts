export type BiPeriod = 'jour' | 'semaine' | 'mois';

export type FuelMode = 'raw' | 'drift';

type FuelKind = 'diesel' | 'essence';
type VehicleType = 'camion' | 'voiture' | 'utilitaire' | 'fourgon' | 'pickup' | 'bus';

interface FuelVehicle {
  plate: string;
  value: number;
  est: number;
  km: number;
  type: VehicleType;
  fuel: FuelKind;
  cpct?: number;
}

export interface FuelBar {
  plate: string;
  pct: string;
  w: number;
}

export interface DriftBar {
  plate: string;
  est: string;
  real: string;
  drift: string;
  cost: string;
  color: string;
  barW: number;
  barLeft: number;
}

export interface DriftLegendItem {
  color: string;
  label: string;
}

export interface DriverRiskBar {
  name: string;
  score: number;
  w: number;
  color: string;
}

export interface TopCriticalAlertBar {
  rank: number;
  label: string;
  count: number;
  w: number;
}

export interface AlertSplitBar {
  label: string;
  count: number;
  pct: number;
  w: number;
  color: string;
}

export interface FuelBiData {
  avgPct: string;
  bars: FuelBar[];
  costDay: string;
  costMonth: string;
  litersDay: string;
  fleetKm: string;
  fuelPrice: string;
  driftIndex: string;
  avgFuel: string;
  avgEst: string;
  driftCostDay: string;
  driftLitersDay: string;
  driftBars: DriftBar[];
  driftLegend: DriftLegendItem[];
}

export interface BiKpis {
  fuel: FuelBiData;
  driverAvgScore: number;
  driverBars: DriverRiskBar[];
  topCriticalAlerts: TopCriticalAlertBar[];
  topCriticalLabel: string;
  topCriticalCount: number;
  alertSplit: AlertSplitBar[];
  alertTotal: number;
  alertTopShare: number;
}

const FUEL_PRICES: Record<FuelKind, number> = { diesel: 2.525, essence: 2.775 };
const FUEL_PRICE = FUEL_PRICES.diesel;
const FLEET_KM_YESTERDAY = 4850;
const AVG_FUEL = 14.2;
const FUEL_DISPLAY_TYPE: VehicleType = 'camion';

const DRIFT_OK = 10;
const DRIFT_WATCH = 25;
const DRIFT_COLORS = { ok: '#15803D', watch: '#F59E0B', bad: '#DC2626' } as const;
const DRIFT_ZERO = 22;
const DRIFT_RIGHT_SPAN = 78;
const DRIFT_MAX_POS = 110;
const DRIFT_LEFT_SPAN = 22;
const DRIFT_MAX_NEG = 25;

const TOP_FUEL: FuelVehicle[] = [
  { plate: '216 TU 4521', value: 20.3, est: 17.2, km: 180, type: 'camion', fuel: 'diesel', cpct: 80.0 },
  { plate: '156 TU 8890', value: 14.9, est: 16.2, km: 210, type: 'camion', fuel: 'diesel', cpct: 13.0 },
  { plate: '178 TU 2043', value: 24.1, est: 17.0, km: 165, type: 'camion', fuel: 'diesel', cpct: 66.0 },
  { plate: '134 TU 9917', value: 17.9, est: 16.9, km: 240, type: 'camion', fuel: 'diesel', cpct: 24.0 },
  { plate: '195 TU 5560', value: 21.1, est: 16.5, km: 130, type: 'camion', fuel: 'diesel', cpct: 42.0 },
  { plate: '089 TU 6602', value: 16.9, est: 8.4, km: 95, type: 'voiture', fuel: 'essence' },
  { plate: '241 TU 3305', value: 13.8, est: 8.4, km: 85, type: 'voiture', fuel: 'essence' },
  { plate: '072 TU 1188', value: 7.9, est: 6.9, km: 120, type: 'voiture', fuel: 'essence' },
  { plate: '263 TU 4471', value: 11.2, est: 8.1, km: 70, type: 'voiture', fuel: 'essence' },
  { plate: '118 TU 7734', value: 9.4, est: 7.5, km: 140, type: 'voiture', fuel: 'diesel' },
  { plate: '302 TU 1147', value: 15.2, est: 11.5, km: 140, type: 'utilitaire', fuel: 'diesel' },
  { plate: '144 TU 8820', value: 12.6, est: 11.2, km: 175, type: 'utilitaire', fuel: 'diesel' },
  { plate: '227 TU 3396', value: 14.9, est: 11.8, km: 110, type: 'utilitaire', fuel: 'diesel' },
  { plate: '081 TU 6215', value: 11.0, est: 11.4, km: 190, type: 'utilitaire', fuel: 'diesel' },
  { plate: '205 TU 4409', value: 13.7, est: 10.9, km: 150, type: 'fourgon', fuel: 'diesel' },
  { plate: '163 TU 7752', value: 16.4, est: 11.3, km: 100, type: 'fourgon', fuel: 'diesel' },
  { plate: '091 TU 2288', value: 12.1, est: 11.0, km: 165, type: 'fourgon', fuel: 'diesel' },
  { plate: '247 TU 1903', value: 13.2, est: 10.2, km: 130, type: 'pickup', fuel: 'diesel' },
  { plate: '119 TU 6640', value: 15.8, est: 10.6, km: 90, type: 'pickup', fuel: 'diesel' },
  { plate: '184 TU 3357', value: 11.5, est: 10.4, km: 160, type: 'pickup', fuel: 'diesel' },
  { plate: '052 TU 8801', value: 24.6, est: 22.0, km: 145, type: 'bus', fuel: 'diesel' },
  { plate: '099 TU 4412', value: 26.9, est: 22.5, km: 120, type: 'bus', fuel: 'diesel' },
];

const TOP_CRITICAL_ALERTS = [
  { label: 'Indicateur de panne ABS', count: 34 },
  { label: 'Porte du conducteur', count: 27 },
  { label: 'SOS', count: 21 },
  { label: 'Feux de position', count: 18 },
  { label: 'Batterie débranchée', count: 15 },
  { label: 'Indicateur airbags', count: 11 },
];

const ALERT_SPLIT = [
  { label: 'Défaut alerte tableau de bord', count: 148, color: '#DC2626' },
  { label: 'Alerte Sécurité', count: 42, color: '#F59E0B' },
  { label: 'Alerte Gestion de parc', count: 18, color: '#4F46E5' },
  { label: 'Alerte Geofencing', count: 9, color: '#2563EB' },
  { label: 'Alerte Qualité de conduite', count: 6, color: '#15803D' },
];

const DRIVERS = [
  { name: 'Ahmed B.', score: 62 },
  { name: 'Salma T.', score: 58 },
  { name: 'Karim M.', score: 51 },
  { name: 'Nizar H.', score: 44 },
  { name: 'Mouna K.', score: 33 },
  { name: 'Yassine R.', score: 22 },
];

const PERIOD_SCALE: Record<BiPeriod, number> = {
  jour: 1,
  semaine: 6.2,
  mois: 27,
};

function fmtNum(n: number, dec = 0): string {
  const s = Number(n).toFixed(dec);
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return parts.join(',');
}

function litersOf(v: FuelVehicle): number {
  return (v.value * v.km) / 100;
}

function driftPct(v: FuelVehicle): number {
  return ((v.value - v.est) / v.est) * 100;
}

function driftCostOf(v: FuelVehicle): number {
  return ((v.value - v.est) / 100) * v.km * FUEL_PRICES[v.fuel];
}

function buildFuel(scale: number): FuelBiData {
  const shown = TOP_FUEL.filter((f) => f.type === FUEL_DISPLAY_TYPE);
  const fleetLiters = TOP_FUEL.reduce((s, v) => s + litersOf(v), 0) || 1;
  const pctOf = (v: FuelVehicle) =>
    v.cpct != null ? v.cpct : (litersOf(v) / fleetLiters) * 100;

  const consRanked = [...shown].sort((a, b) => pctOf(b) - pctOf(a));
  const maxPct = consRanked.length ? Math.max(...consRanked.map(pctOf)) : 1;
  const bars: FuelBar[] = consRanked.map((v) => ({
    plate: v.plate,
    pct: fmtNum(pctOf(v), 1),
    w: Math.round((pctOf(v) / maxPct) * 100),
  }));
  const avgPct =
    consRanked.length === 0
      ? 0
      : consRanked.reduce((s, v) => s + pctOf(v), 0) / consRanked.length;

  const litersDay = (FLEET_KM_YESTERDAY * AVG_FUEL) / 100;
  const costDay = litersDay * FUEL_PRICE;

  const nShown = shown.length || 1;
  const avgFuelShown = shown.reduce((s, v) => s + v.value, 0) / nShown;
  const avgEstShown = shown.reduce((s, v) => s + v.est, 0) / nShown;
  const fleetDrift = avgEstShown
    ? ((avgFuelShown - avgEstShown) / avgEstShown) * 100
    : 0;
  const driftLitersDay = shown.reduce(
    (s, v) => s + ((v.value - v.est) / 100) * v.km,
    0
  );
  const driftCostDay = shown.reduce((s, v) => s + driftCostOf(v), 0);

  const driftBars: DriftBar[] = [...shown]
    .sort((a, b) => driftPct(b) - driftPct(a))
    .map((v) => {
      const d = driftPct(v);
      const color =
        d <= DRIFT_OK
          ? DRIFT_COLORS.ok
          : d <= DRIFT_WATCH
            ? DRIFT_COLORS.watch
            : DRIFT_COLORS.bad;
      const w =
        d >= 0
          ? (Math.min(d, DRIFT_MAX_POS) / DRIFT_MAX_POS) * DRIFT_RIGHT_SPAN
          : (Math.min(-d, DRIFT_MAX_NEG) / DRIFT_MAX_NEG) * DRIFT_LEFT_SPAN;
      const cost = driftCostOf(v);
      return {
        plate: v.plate,
        est: v.est.toFixed(1).replace('.', ','),
        real: v.value.toFixed(1).replace('.', ','),
        drift: `${d >= 0 ? '+' : '−'}${Math.abs(Math.round(d))}%`,
        cost: `${cost >= 0 ? '+' : '−'}${fmtNum(Math.abs(cost), 0)}`,
        color,
        barW: Number(w.toFixed(1)),
        barLeft: Number((d >= 0 ? DRIFT_ZERO : DRIFT_ZERO - w).toFixed(1)),
      };
    });

  return {
    avgPct: fmtNum(avgPct, 1),
    bars,
    costDay: fmtNum(costDay * scale, 0),
    costMonth: fmtNum(costDay * 30, 0),
    litersDay: fmtNum(litersDay * scale, 0),
    fleetKm: fmtNum(FLEET_KM_YESTERDAY * scale, 0),
    fuelPrice: FUEL_PRICE.toFixed(3).replace('.', ','),
    driftIndex: `${fleetDrift >= 0 ? '+' : '−'}${Math.abs(Math.round(fleetDrift))}%`,
    avgFuel: avgFuelShown.toFixed(1).replace('.', ','),
    avgEst: avgEstShown.toFixed(1).replace('.', ','),
    driftCostDay: fmtNum(driftCostDay * scale, 0),
    driftLitersDay: fmtNum(driftLitersDay * scale, 0),
    driftBars,
    driftLegend: [
      { color: DRIFT_COLORS.ok, label: `Conforme, sous +${DRIFT_OK}%` },
      {
        color: DRIFT_COLORS.watch,
        label: `À surveiller, +${DRIFT_OK} à +${DRIFT_WATCH}%`,
      },
      {
        color: DRIFT_COLORS.bad,
        label: `Dérive, au-delà de +${DRIFT_WATCH}%`,
      },
    ],
  };
}

function buildTopCritical(scale: number): {
  bars: TopCriticalAlertBar[];
  label: string;
  count: number;
} {
  const scaled = TOP_CRITICAL_ALERTS.map((a) => ({
    ...a,
    count: Math.max(1, Math.round(a.count * scale)),
  }));
  const critMax = Math.max(...scaled.map((a) => a.count));
  return {
    bars: scaled.map((a, i) => ({
      rank: i + 1,
      label: a.label,
      count: a.count,
      w: Math.round((a.count / critMax) * 100),
    })),
    label: scaled[0].label,
    count: scaled[0].count,
  };
}

function buildAlertSplit(scale: number): {
  bars: AlertSplitBar[];
  total: number;
  topShare: number;
} {
  const scaled = ALERT_SPLIT.map((a) => ({
    ...a,
    count: Math.max(1, Math.round(a.count * scale)),
  }));
  const total = scaled.reduce((s, a) => s + a.count, 0);
  const alertMax = Math.max(...scaled.map((a) => a.count));
  return {
    bars: scaled.map((a) => ({
      label: a.label,
      count: a.count,
      pct: Math.round((a.count / total) * 100),
      w: Math.round((a.count / alertMax) * 100),
      color: a.color,
    })),
    total,
    topShare: Math.round((scaled[0].count / total) * 100),
  };
}

function buildDrivers(): { avg: number; bars: DriverRiskBar[] } {
  const bars = DRIVERS.map((d) => ({
    name: d.name,
    score: d.score,
    w: Math.round((d.score / 100) * 100),
    color: d.score > 50 ? '#DC2626' : d.score >= 30 ? '#F59E0B' : '#15803D',
  }));
  // Headline score from mockup (not a simple mean of the displayed bars).
  return { avg: 34, bars };
}

export function getBiKpis(period: BiPeriod): BiKpis {
  const scale = PERIOD_SCALE[period];
  const fuel = buildFuel(scale);
  const drivers = buildDrivers();
  const critical = buildTopCritical(scale);
  const split = buildAlertSplit(scale);

  return {
    fuel,
    driverAvgScore: drivers.avg,
    driverBars: drivers.bars,
    topCriticalAlerts: critical.bars,
    topCriticalLabel: critical.label,
    topCriticalCount: critical.count,
    alertSplit: split.bars,
    alertTotal: split.total,
    alertTopShare: split.topShare,
  };
}
