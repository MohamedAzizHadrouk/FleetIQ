import {
  ACTORS,
  LOW_ENT_TITLE,
  MONTHS,
  SUBS,
  TOP_ENT_TITLE,
} from '../constants';
import { formatDT, formatPct, matrixKey } from './format';
import { monthly, rng, speStats, val } from '../mock/expenses-mock';
import type {
  ActorType,
  ComputedExpenses,
  ExpensesFiltersState,
  InsightItem,
  KpiItem,
  RankItem,
  SubRubriqueKey,
} from '../types';

export function defaultEntities(actorType: ActorType): string[] {
  return [...ACTORS[actorType].entities];
}

export function defaultSubs(actorType: ActorType): SubRubriqueKey[] {
  return Object.keys(ACTORS[actorType].subs) as SubRubriqueKey[];
}

export function computeExpenses(filters: ExpensesFiltersState): ComputedExpenses {
  const actor = ACTORS[filters.actorType];
  const entities = actor.entities.filter((e) => filters.entities.includes(e));
  const subs = (Object.keys(SUBS) as SubRubriqueKey[]).filter(
    (k) => actor.subs[k] && filters.subs.includes(k)
  );

  const matrix: Record<string, number> = {};
  let total = 0;
  const bySub = {} as Record<SubRubriqueKey, number>;
  const byEnt: Record<string, number> = {};
  const byMonth = MONTHS.map(() => ({} as Record<SubRubriqueKey, number>));
  const byMonthEnt = MONTHS.map(() => ({} as Record<string, number>));

  subs.forEach((s) => {
    bySub[s] = 0;
    entities.forEach((e) => {
      const v = val(filters.actorType, s, e);
      matrix[matrixKey(s, e)] = v;
      bySub[s] += v;
      byEnt[e] = (byEnt[e] || 0) + v;
      total += v;
      monthly(filters.actorType, s, e, v).forEach((mv, i) => {
        byMonth[i][s] = (byMonth[i][s] || 0) + mv;
        byMonthEnt[i][e] = (byMonthEnt[i][e] || 0) + mv;
      });
    });
  });

  const prevTotal = Math.round(
    total * (0.82 + rng(filters.actorType + entities.length + subs.length)() * 0.3)
  );
  const deltaPct = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : 0;
  const avg = entities.length ? total / entities.length : 0;

  const topSubEntry = (Object.entries(bySub) as [SubRubriqueKey, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const topEntEntry = Object.entries(byEnt).sort((a, b) => b[1] - a[1])[0];
  const topSub = topSubEntry ?? null;
  const topEnt = topEntEntry ?? null;

  const ranked: RankItem[] = Object.entries(byEnt)
    .sort((a, b) => b[1] - a[1])
    .map(([entity, amount]) => ({ entity, amount }));

  const insights: InsightItem[] = [];
  if (topEnt && topEnt[1] && avg) {
    insights.push({
      tone: 'warn',
      title: 'Au-dessus de la moyenne',
      text: `${topEnt[0]} coûte ${formatDT(topEnt[1])}, soit +${Math.round((topEnt[1] / avg - 1) * 100)} %.`,
    });
  }
  if (topSub && total) {
    insights.push({
      tone: 'info',
      title: 'Poste principal',
      text: `${SUBS[topSub[0]].name} représente ${Math.round((topSub[1] / total) * 100) || 0} % des dépenses (${formatDT(topSub[1])}).`,
    });
  }
  const low = ranked[ranked.length - 1];
  if (low && low.amount && ranked.length > 1 && total) {
    insights.push({
      tone: 'ok',
      title: LOW_ENT_TITLE[filters.actorType],
      text: `${low.entity} : ${formatDT(low.amount)} dépensés sur la période (${Math.round((low.amount / total) * 100)} % du total), le montant le plus bas des ${actor.plural.toLowerCase()} sélectionnés.`,
    });
  }

  const kpis: KpiItem[] = [
    {
      id: 'total',
      label: 'Total dépenses',
      value: formatDT(total),
      detail: '',
      deltaPct: filters.compare ? deltaPct : undefined,
    },
    {
      id: 'top-sub',
      label: 'Sous-rubrique la plus lourde',
      value: topSub ? SUBS[topSub[0]].name : '—',
      detail: topSub
        ? `${formatDT(topSub[1])} · ${Math.round((topSub[1] / total) * 100)} % du total`
        : '',
      action: topSub ? { kind: 'sub', value: topSub[0] } : undefined,
    },
    {
      id: 'top-ent',
      label: TOP_ENT_TITLE[filters.actorType],
      value: topEnt ? topEnt[0] : '—',
      detail: topEnt
        ? `${formatDT(topEnt[1])} · ${Math.round((topEnt[1] / total) * 100)} % du total`
        : '',
      action: topEnt ? { kind: 'ent', value: topEnt[0] } : undefined,
      isNew: true,
    },
  ];

  const spe =
    filters.actorType === 'dep' || filters.actorType === 'spe'
      ? speStats(filters.actorType, entities, matrix, byEnt)
      : null;

  return {
    matrix,
    bySub,
    byEnt,
    byMonth,
    byMonthEnt,
    total,
    prevTotal,
    deltaPct,
    avg,
    entities,
    subs,
    topSub,
    topEnt,
    ranked,
    insights,
    kpis,
    speStats: spe,
  };
}

export function heatIntensity(value: number, max: number): number {
  if (!max) return 0;
  return (value / max) * 0.28;
}

export function formatShare(part: number, total: number): string {
  if (!total) return formatPct(0);
  return formatPct((part / total) * 100);
}
