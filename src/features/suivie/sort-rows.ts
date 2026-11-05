import type { SuivieRow } from './mock-data';

export type SortDir = 'asc' | 'desc';
export type SortType = 'number' | 'date' | 'duration' | 'string';

export interface ColumnSortState {
  columnId: string;
  dir: SortDir;
}

const NUMBER_COLUMNS = new Set([
  'speed',
  'Speed',
  'AvgSpeed',
  'Mileage',
  'FuelLevel',
  'Fuel',
  'TotalFuel',
  'FuelConsumptionAvgInL100Km',
  'BatteryLevel',
  'ElockBattery',
  'BatteryLevelSonde1',
  'Temperature',
  'EngineTemperature',
  'TemperatureSonde1',
  'HumidityLevel',
  'AdBlueLevel',
  'VolumeSonde1',
  'Latitude',
  'Longitude',
  'RPM',
  'AxleWeight1st',
  'AxleWeight',
  'AxleWeight3rd',
  'AxleWeight4th',
  'RapidBrackings',
  'RapidAccelerations',
  'Distance',
  'Direction',
]);

const DATE_COLUMNS = new Set([
  'date',
  'Date',
  'StartDate',
  'SendDate',
  'LastAlert',
]);

const DURATION_COLUMNS = new Set([
  'horodatage',
  'Period',
  'engineHours',
  'EngineHours',
]);

export function getColumnSortType(columnId: string): SortType {
  if (NUMBER_COLUMNS.has(columnId)) return 'number';
  if (DATE_COLUMNS.has(columnId)) return 'date';
  if (DURATION_COLUMNS.has(columnId)) return 'duration';
  return 'string';
}

function parseNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const raw = String(value ?? '').trim();
  if (!raw || raw === '—') return Number.NaN;
  const normalized = raw.replace(/\s/g, '').replace(',', '.');
  const match = normalized.match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

function parseDate(value: unknown, row: SuivieRow): number {
  if (row.filterDate) {
    const fromFilter = Date.parse(String(row.filterDate).replace(' ', 'T'));
    if (!Number.isNaN(fromFilter)) return fromFilter;
  }
  const raw = String(value ?? '').trim();
  if (!raw || raw === '—') return Number.NaN;

  // FR display: DD/MM/YYYY HH:mm:ss
  const fr = raw.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (fr) {
    const [, dd, mm, yyyy, hh = '0', min = '0', ss = '0'] = fr;
    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss)
    ).getTime();
  }

  // YYYY/MM/DD HH:mm:ss
  const slash = raw.replace(/\//g, '-').replace(' ', 'T');
  const t = Date.parse(slash);
  return Number.isNaN(t) ? Number.NaN : t;
}

/** Convert relative durations like "12 mn", "3 h", "2 j" or "01:23:45" to minutes. */
function parseDurationMinutes(value: unknown): number {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw || raw === '—') return Number.NaN;

  const relative = raw.match(/^(\d+(?:[.,]\d+)?)\s*(mn|min|h|j|d)\b/);
  if (relative) {
    const n = Number(relative[1].replace(',', '.'));
    const unit = relative[2];
    if (unit === 'mn' || unit === 'min') return n;
    if (unit === 'h') return n * 60;
    return n * 24 * 60; // j / d
  }

  const hms = raw.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (hms) {
    const h = Number(hms[1]);
    const m = Number(hms[2]);
    const s = Number(hms[3] ?? 0);
    return h * 60 + m + s / 60;
  }

  return parseNumber(raw);
}

function compareNullable(
  a: number,
  b: number,
  dir: SortDir
): number | null {
  const aNaN = Number.isNaN(a);
  const bNaN = Number.isNaN(b);
  if (aNaN && bNaN) return 0;
  if (aNaN) return 1;
  if (bNaN) return -1;
  if (a === b) return 0;
  const cmp = a < b ? -1 : 1;
  return dir === 'asc' ? cmp : -cmp;
}

function getCellValue(row: SuivieRow, columnId: string): unknown {
  return row[columnId];
}

export function compareSuivieRows(
  a: SuivieRow,
  b: SuivieRow,
  columnId: string,
  dir: SortDir
): number {
  const type = getColumnSortType(columnId);
  const av = getCellValue(a, columnId);
  const bv = getCellValue(b, columnId);

  if (type === 'number') {
    const cmp = compareNullable(parseNumber(av), parseNumber(bv), dir);
    return cmp ?? 0;
  }

  if (type === 'date') {
    const cmp = compareNullable(parseDate(av, a), parseDate(bv, b), dir);
    return cmp ?? 0;
  }

  if (type === 'duration') {
    const cmp = compareNullable(
      parseDurationMinutes(av),
      parseDurationMinutes(bv),
      dir
    );
    return cmp ?? 0;
  }

  const as = String(av ?? '').trim();
  const bs = String(bv ?? '').trim();
  const cmp = as.localeCompare(bs, 'fr', {
    sensitivity: 'base',
    numeric: true,
  });
  return dir === 'asc' ? cmp : -cmp;
}

export function sortSuivieRows(
  rows: SuivieRow[],
  sort: ColumnSortState | null
): SuivieRow[] {
  if (!sort) return rows;
  return rows
    .slice()
    .sort((a, b) => compareSuivieRows(a, b, sort.columnId, sort.dir));
}

export function nextSortState(
  current: ColumnSortState | null,
  columnId: string
): ColumnSortState | null {
  if (!current || current.columnId !== columnId) {
    return { columnId, dir: 'asc' };
  }
  if (current.dir === 'asc') return { columnId, dir: 'desc' };
  return null;
}
