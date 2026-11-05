/**
 * Semantic palette for Dépenses générales.
 * - ok (green): normal
 * - warn (orange): abnormal but not serious
 * - critical (red): very serious
 * - info (platform blue): neutral / data / UI — neither severity nor “normal”
 * Keep usage sparse; prefer slate for chrome.
 */

export type StatusTone = 'ok' | 'warn' | 'critical' | 'info';

/** Gap vs average above which an expense is treated as critical. */
export const CRITICAL_DELTA_PCT = 30;

export const STATUS = {
  ok: {
    solid: '#16a34a',
    soft: '#f0fdf4',
    border: '#bbf7d0',
    text: '#15803d',
    muted: '#4ade80',
  },
  warn: {
    solid: '#ea580c',
    soft: '#fff7ed',
    border: '#fed7aa',
    text: '#c2410c',
    muted: '#fb923c',
  },
  critical: {
    solid: '#dc2626',
    soft: '#fef2f2',
    border: '#fecaca',
    text: '#b91c1c',
    muted: '#f87171',
  },
  info: {
    solid: '#2563eb',
    soft: '#eff6ff',
    border: '#bfdbfe',
    text: '#1d4ed8',
    muted: '#60a5fa',
  },
} as const;

/** Blue degradations for categorical / chart series (non-severity). */
export const BLUE_SCALE = [
  '#1e3a8a',
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#0ea5e9',
  '#0284c7',
  '#64748b',
  '#475569',
] as const;

export function statusFromDeltaPct(deltaPct: number): Exclude<StatusTone, 'info'> {
  if (deltaPct <= 0) return 'ok';
  if (deltaPct <= CRITICAL_DELTA_PCT) return 'warn';
  return 'critical';
}

/** Fuel real/est ratio: ≤1 normal, ≤1.2 attention, >1.2 critical. */
export function statusFromOverRatio(ratio: number): Exclude<StatusTone, 'info'> {
  if (ratio <= 1) return 'ok';
  if (ratio <= 1.2) return 'warn';
  return 'critical';
}

export const STATUS_DOT_CLASS: Record<StatusTone, string> = {
  ok: 'bg-green-600',
  warn: 'bg-orange-600',
  critical: 'bg-red-600',
  info: 'bg-blue-600',
};

export const STATUS_TEXT_CLASS: Record<StatusTone, string> = {
  ok: 'text-green-700',
  warn: 'text-orange-700',
  critical: 'text-red-700',
  info: 'text-blue-700',
};

export const STATUS_BADGE_CLASS: Record<StatusTone, string> = {
  ok: 'bg-green-50 text-green-700',
  warn: 'bg-orange-50 text-orange-700',
  critical: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

/** Human labels — short, glanceable. */
export const STATUS_LABEL: Record<Exclude<StatusTone, 'info'>, string> = {
  ok: 'Normal',
  warn: 'Attention',
  critical: 'Critique',
};

export const STATUS_LABEL_ALL: Record<StatusTone, string> = {
  ok: 'Normal',
  warn: 'Attention',
  critical: 'Critique',
  info: 'Info',
};

/** Whole-row / mini-card chrome: left rail + soft fill + border. */
export const STATUS_CARD_CLASS: Record<StatusTone, string> = {
  ok: 'border-green-200 bg-green-50/70 hover:bg-green-50',
  warn: 'border-orange-200 bg-orange-50/70 hover:bg-orange-50',
  critical: 'border-red-200 bg-red-50/70 hover:bg-red-50',
  info: 'border-blue-200 bg-blue-50/70 hover:bg-blue-50',
};

export const STATUS_RAIL_CLASS: Record<StatusTone, string> = {
  ok: 'bg-green-600',
  warn: 'bg-orange-600',
  critical: 'bg-red-600',
  info: 'bg-blue-600',
};
