export type ActorType = 'car' | 'drv' | 'dep' | 'spe';

export type SubRubriqueKey =
  | 'maint'
  | 'fuel'
  | 'tire'
  | 'rent'
  | 'docs'
  | 'acc'
  | 'miss'
  | 'buy'
  | 'cons';

export type LinkLevel = 'y' | 'i';

/** Aujourd'hui | Ce mois | Trimestre | Année 2026 | Personnalisée */
export type PeriodPreset = 0 | 1 | 2 | 3 | 4;

export type InsightTone = 'warn' | 'info' | 'ok';

export type MaintMode = 'all' | 'km' | 'h';

export interface SubRubriqueDef {
  key: SubRubriqueKey;
  name: string;
  color: string;
  src: string;
  menu: string;
  isNew?: boolean;
}

export interface ActorDef {
  key: ActorType;
  name: string;
  plural: string;
  isNew?: boolean;
  entities: string[];
  subs: Partial<Record<SubRubriqueKey, LinkLevel>>;
}

export interface VehicleMeta {
  icon: string;
  specialty: string;
}

export interface ExpensesFiltersState {
  actorType: ActorType;
  period: PeriodPreset;
  dateFrom: string;
  dateTo: string;
  compare: boolean;
  entities: string[];
  subs: SubRubriqueKey[];
}

export interface InsightItem {
  tone: InsightTone;
  title: string;
  text: string;
}

export interface KpiItem {
  id: string;
  label: string;
  value: string;
  detail: string;
  deltaPct?: number;
  action?: { kind: 'sub' | 'ent'; value: string };
  isNew?: boolean;
}

export interface RankItem {
  entity: string;
  amount: number;
}

export interface OperationRow {
  date: string;
  sub: SubRubriqueKey;
  entity: string;
  amount: number;
  supplier: string;
  ref: string;
}

export interface SpeStat {
  entity: string;
  total: number;
  fixed: number;
  variable: number;
  km: number;
  fuel: number;
  perKm: number;
  maint: number;
  unpl: number;
  warr: number;
  over: number;
  overPct: number;
  extra: number;
  rec: number;
}

export interface FuelVehicleRow {
  matricule: string;
  icon: string;
  specialty: string;
  department: string;
  km: number;
  est: number;
  real: number;
  gap: number;
  fuel: 'Diesel' | 'Essence';
  price: number;
  prev: number;
  reel: number;
  trop: number;
  dt: number;
}

export interface FuelDetail {
  rows: FuelVehicleRow[];
  km: number;
  prev: number;
  reel: number;
  trop: number;
  dt: number;
  cost: number;
  est: number;
  real: number;
  pct: number;
}

export interface DepVehicle {
  matricule: string;
  icon: string;
  specialty: string;
  department: string;
  subs: Partial<Record<SubRubriqueKey, number>>;
  tot: number;
}

export interface DepSplit {
  veh: DepVehicle[];
  other: Partial<Record<SubRubriqueKey, number>>;
  vehTot: number;
  otherTot: number;
}

export interface MaintPlanItem {
  matricule: string;
  icon: string;
  type: string;
  mode: 'km' | 'h';
  cur: number;
  every: number;
  next: number;
  left: number;
  warn: number;
  soon: boolean;
}

export interface MaintDoneItem {
  date: string;
  matricule: string;
  icon: string;
  type: string;
  mode: 'km' | 'h';
  amount: number;
  ref: string;
}

export type DrawerView =
  | { kind: 'ops'; sub: SubRubriqueKey | null; entity: string | null }
  | { kind: 'dept'; entity: string }
  | { kind: 'deptCar'; entity: string; vehicleIndex: number }
  | { kind: 'km'; entity: string }
  | { kind: 'fuel'; entity: string }
  | { kind: 'maint'; entity: string };

export interface ComputedExpenses {
  matrix: Record<string, number>;
  bySub: Record<SubRubriqueKey, number>;
  byEnt: Record<string, number>;
  byMonth: Record<SubRubriqueKey, number>[];
  byMonthEnt: Record<string, number>[];
  total: number;
  prevTotal: number;
  deltaPct: number;
  avg: number;
  entities: string[];
  subs: SubRubriqueKey[];
  topSub: [SubRubriqueKey, number] | null;
  topEnt: [string, number] | null;
  ranked: RankItem[];
  insights: InsightItem[];
  kpis: KpiItem[];
  speStats: SpeStat[] | null;
}
