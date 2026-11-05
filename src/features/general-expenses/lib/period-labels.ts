import { MONTHS, PERIODS } from '../constants';
import type { ActorType, PeriodPreset } from '../types';
import { ACTORS } from '../constants';

/** Month indices (0–11) to display for the selected period filter. */
export function monthIndicesForPeriod(period: PeriodPreset): number[] {
  switch (period) {
    case 0: // Aujourd'hui — current calendar day (mock: 29 Oct 2026)
      return [9];
    case 1: // Ce mois
      return [9];
    case 2: // Trimestre — Q4 2026 (Oct–Déc) aligned with current month
      return [9, 10, 11];
    case 3: // Année — all 12 months
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    case 4: // Personnalisée — full year slice for mock visibility
    default:
      return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  }
}

export function monthLabelsForPeriod(period: PeriodPreset): string[] {
  if (period === 0) return ["Aujourd'hui"];
  return monthIndicesForPeriod(period).map((i) => MONTHS[i]);
}

export function chartTitleForFilters(
  actorType: ActorType,
  period: PeriodPreset
): { title: string; subtitle: string } {
  const actor = ACTORS[actorType];
  const periodLabel = PERIODS[period];
  const isGroup = actorType === 'dep' || actorType === 'spe';

  return {
    title: `Évolution · ${periodLabel}`,
    subtitle: isGroup
      ? `par ${actor.name.toLowerCase()} (groupé)`
      : `par sous-rubrique · ${actor.plural.toLowerCase()}`,
  };
}
