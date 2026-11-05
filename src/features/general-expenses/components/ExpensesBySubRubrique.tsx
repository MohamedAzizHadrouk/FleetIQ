import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { ACTORS, GROUP_META, SUB_TYPES, SUBS } from '../constants';
import { formatDT } from '../lib/format';
import { BLUE_SCALE } from '../lib/status-colors';
import { splitTypes } from '../mock/expenses-mock';
import type { ActorType, SubRubriqueKey } from '../types';

/** Rows per page on the ventilation card — keeps height aligned with the pie card. */
const DETAIL_PAGE_SIZE = 6;

interface ExpensesBySubRubriqueProps {
  actorType: ActorType;
  entities: string[];
  bySub: Record<SubRubriqueKey, number>;
  matrix: Record<string, number>;
  total: number;
  byEnt: Record<string, number>;
}

interface PieSlice {
  key: SubRubriqueKey;
  name: string;
  value: number;
  color: string;
  pct: number;
}

interface DetailRow {
  name: string;
  value: number;
  color: string;
  pct: number;
}

export function ExpensesBySubRubrique({
  actorType,
  entities,
  bySub,
  matrix,
  total,
  byEnt,
}: ExpensesBySubRubriqueProps) {
  const isGroup = actorType === 'dep' || actorType === 'spe';
  const actor = ACTORS[actorType];
  const [depFilter, setDepFilter] = useState('all');
  const [selectedSub, setSelectedSub] = useState<SubRubriqueKey | null>(null);
  const [detailPage, setDetailPage] = useState(0);

  const activeFilter =
    isGroup && depFilter !== 'all' && entities.includes(depFilter)
      ? depFilter
      : 'all';
  const one = isGroup && activeFilter !== 'all';
  const colors = isGroup ? GROUP_META[actorType].colors : {};

  const subVal = (s: SubRubriqueKey) =>
    one ? matrix[`${s}|${activeFilter}`] || 0 : bySub[s] || 0;
  const base = one ? byEnt[activeFilter] || 0 : total;

  const subRows = useMemo(() => {
    return (Object.keys(bySub) as SubRubriqueKey[])
      .map((s) => [s, subVal(s)] as const)
      .filter((r) => r[1] > 0)
      .sort((a, b) => b[1] - a[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bySub, matrix, activeFilter, one]);

  const typeKey =
    actorType +
    [...entities].sort().join(',') +
    (one ? activeFilter : '');

  useEffect(() => {
    if (!subRows.length) {
      setSelectedSub(null);
      return;
    }
    setSelectedSub((prev) =>
      prev && subRows.some(([s]) => s === prev) ? prev : subRows[0][0]
    );
  }, [subRows]);

  const selectedAmount = selectedSub ? subVal(selectedSub) : 0;
  const selectedPct =
    base && selectedAmount ? Math.round((selectedAmount / base) * 100) : 0;

  const pieSlices: PieSlice[] = useMemo(() => {
    const sum = subRows.reduce((a, [, v]) => a + v, 0) || 1;
    return subRows.map(([s, v]) => ({
      key: s,
      name: SUBS[s].name,
      value: v,
      color: SUBS[s].color,
      pct: Math.round((v / sum) * 100),
    }));
  }, [subRows]);

  const detailRows: DetailRow[] = useMemo(() => {
    if (!selectedSub || selectedAmount <= 0) return [];

    if (SUB_TYPES[selectedSub]) {
      const parts = splitTypes(selectedSub, selectedAmount, typeKey);
      const sum = parts.reduce((a, p) => a + p.v, 0) || 1;
      return parts.map((p, i) => ({
        name: p.n,
        value: p.v,
        color: BLUE_SCALE[i % BLUE_SCALE.length],
        pct: Math.round((p.v / sum) * 100),
      }));
    }

    const rows = entities
      .map((e, i) => {
        const value = one
          ? e === activeFilter
            ? selectedAmount
            : 0
          : matrix[`${selectedSub}|${e}`] || 0;
        return {
          name: e,
          value,
          color:
            colors[e] ??
            BLUE_SCALE[i % BLUE_SCALE.length] ??
            SUBS[selectedSub].color,
        };
      })
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);

    const sum = rows.reduce((a, r) => a + r.value, 0) || 1;
    return rows.map((r) => ({
      ...r,
      pct: Math.round((r.value / sum) * 100),
    }));
  }, [
    selectedSub,
    selectedAmount,
    typeKey,
    entities,
    one,
    activeFilter,
    matrix,
    colors,
  ]);

  const detailMax = Math.max(1, ...detailRows.map((r) => r.value));
  const topDetailName = detailRows[0]?.name;

  const detailPageCount = Math.max(
    1,
    Math.ceil(detailRows.length / DETAIL_PAGE_SIZE)
  );

  useEffect(() => {
    setDetailPage(0);
  }, [selectedSub, detailRows.length]);

  useEffect(() => {
    if (detailPage > detailPageCount - 1) {
      setDetailPage(Math.max(0, detailPageCount - 1));
    }
  }, [detailPage, detailPageCount]);

  const pagedDetailRows = detailRows.slice(
    detailPage * DETAIL_PAGE_SIZE,
    detailPage * DETAIL_PAGE_SIZE + DETAIL_PAGE_SIZE
  );

  const detailTitle = selectedSub
    ? SUB_TYPES[selectedSub]
      ? SUB_TYPES[selectedSub]!.label
      : `Répartition par ${actor.name.toLowerCase()}`
    : '';

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-1 pt-1">
        <CardTitle className="text-sm font-semibold text-slate-800">
          Par sous-rubrique
        </CardTitle>
        <span className="text-[11px] text-slate-400">
          sélectionnez à gauche → ventilation à droite
        </span>
      </CardHeader>
      <CardContent className="space-y-3 px-0 pb-2 pt-2">
        {isGroup && (
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDepFilter('all')}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium',
                activeFilter === 'all'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600'
              )}
            >
              Tous
            </button>
            {entities.map((e) => {
              const active = activeFilter === e;
              const c = colors[e];
              return (
                <button
                  key={e}
                  type="button"
                  onClick={() => setDepFilter(e)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
                    active
                      ? 'text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600'
                  )}
                  style={
                    active
                      ? { borderColor: c, background: `${c}18` }
                      : undefined
                  }
                >
                  <span
                    className="inline-block h-2 w-2 rounded-sm"
                    style={{ background: c }}
                  />
                  {e}
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
          {/* Gauche — camembert + légende */}
          <div className="flex h-full min-h-[420px] flex-col p-1">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Répartition
            </p>

            <div className="relative mx-auto h-[220px] w-full max-w-[260px] shrink-0 sm:h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieSlices}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={54}
                    outerRadius={88}
                    paddingAngle={1.5}
                    stroke="#fff"
                    strokeWidth={1.5}
                    onClick={(_, index) => {
                      const slice = pieSlices[index];
                      if (slice) setSelectedSub(slice.key);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {pieSlices.map((d) => (
                      <Cell
                        key={d.key}
                        fill={d.color}
                        opacity={
                          selectedSub && selectedSub !== d.key ? 0.45 : 1
                        }
                        stroke={selectedSub === d.key ? d.color : '#fff'}
                        strokeWidth={selectedSub === d.key ? 3 : 1.5}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload as PieSlice;
                      return (
                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
                          <p className="font-semibold text-slate-900">
                            {d.name}
                          </p>
                          <p className="mt-0.5 tabular-nums text-slate-600">
                            {formatDT(d.value)} · {d.pct} %
                          </p>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {selectedSub && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
                  <span className="text-base font-bold tabular-nums text-slate-900">
                    {selectedPct} %
                  </span>
                  <span className="max-w-[110px] truncate text-[11px] font-medium text-slate-600">
                    {SUBS[selectedSub].name}
                  </span>
                  <span className="text-[11px] tabular-nums text-slate-500">
                    {formatDT(selectedAmount)}
                  </span>
                </div>
              )}
            </div>

            <ul className="mt-3 flex-1 space-y-1">
              {pieSlices.map((d) => {
                const active = selectedSub === d.key;
                return (
                  <li key={d.key}>
                    <button
                      type="button"
                      onClick={() => setSelectedSub(d.key)}
                      className={cn(
                        'relative flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                        active
                          ? 'bg-blue-50 ring-1 ring-blue-200'
                          : 'hover:bg-slate-50'
                      )}
                    >
                      {active && (
                        <span
                          className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-blue-600"
                          aria-hidden
                        />
                      )}
                      <span className="flex min-w-0 items-center gap-1.5">
                        <i
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ background: d.color }}
                        />
                        <span
                          className={cn(
                            'truncate text-[11px]',
                            active
                              ? 'font-semibold text-slate-900'
                              : 'font-medium text-slate-700'
                          )}
                        >
                          {d.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] tabular-nums text-slate-500">
                        {formatDT(d.value)} · {d.pct} %
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Droite — ventilation paginée (même hauteur, sans scroll) */}
          <div className="flex h-full min-h-[420px] flex-col p-1">
            {selectedSub && selectedAmount > 0 ? (
              <>
                <div className="mb-3 flex shrink-0 items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Ventilation
                    </p>
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {SUBS[selectedSub].name}
                      {detailTitle ? ` — ${detailTitle}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold tabular-nums text-slate-900">
                      {formatDT(selectedAmount)}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {selectedPct} % du total
                    </p>
                  </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="space-y-3">
                    {pagedDetailRows.map((row) => {
                      const isTop = row.name === topDetailName;
                      return (
                        <div
                          key={row.name}
                          className="grid grid-cols-[minmax(96px,1fr)_minmax(0,1.4fr)_auto] items-center gap-2 rounded-lg px-1 py-1.5 text-sm sm:grid-cols-[minmax(110px,140px)_1fr_auto]"
                        >
                          <span className="flex min-w-0 items-center gap-1.5 truncate font-medium text-slate-800">
                            <i
                              className="h-2 w-2 shrink-0 rounded-sm"
                              style={{ background: row.color }}
                            />
                            <span className="truncate">{row.name}</span>
                          </span>
                          <div className="h-3 overflow-hidden rounded bg-slate-100">
                            <div
                              className="h-full rounded"
                              style={{
                                width: `${(row.value / detailMax) * 100}%`,
                                background: row.color,
                              }}
                            />
                          </div>
                          <span className="flex items-center gap-1.5 justify-self-end text-right text-xs tabular-nums sm:text-sm">
                            <span className="font-semibold text-slate-900">
                              {formatDT(row.value)}
                            </span>
                            <span className="text-slate-500">{row.pct} %</span>
                            {isTop && (
                              <span className="hidden rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-800 lg:inline">
                                le plus élevé
                              </span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {detailPageCount > 1 && (
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="text-[11px] tabular-nums text-slate-500">
                        {detailPage * DETAIL_PAGE_SIZE + 1}–
                        {Math.min(
                          (detailPage + 1) * DETAIL_PAGE_SIZE,
                          detailRows.length
                        )}{' '}
                        / {detailRows.length}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="Page précédente"
                          disabled={detailPage === 0}
                          onClick={() =>
                            setDetailPage((p) => Math.max(0, p - 1))
                          }
                          className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                            detailPage === 0
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="min-w-[3.5rem] text-center text-[11px] font-medium tabular-nums text-slate-600">
                          {detailPage + 1} / {detailPageCount}
                        </span>
                        <button
                          type="button"
                          aria-label="Page suivante"
                          disabled={detailPage >= detailPageCount - 1}
                          onClick={() =>
                            setDetailPage((p) =>
                              Math.min(detailPageCount - 1, p + 1)
                            )
                          }
                          className={cn(
                            'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors',
                            detailPage >= detailPageCount - 1
                              ? 'cursor-not-allowed text-slate-300'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-sm text-slate-400">
                <p>Sélectionnez une sous-rubrique</p>
                <p className="mt-1 text-xs">
                  à gauche pour afficher sa ventilation
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
