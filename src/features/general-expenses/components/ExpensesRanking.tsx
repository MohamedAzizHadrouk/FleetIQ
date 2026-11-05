import { useMemo, useState } from 'react';
import { Building2, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTORS, VEHICLE_META } from '../constants';
import { formatDT } from '../lib/format';
import { STATUS } from '../lib/status-colors';
import { cn } from '@/lib/utils';
import type { ActorType, RankItem } from '../types';
import { VehicleTypeIcon } from './VehicleTypeIcon';

const TOP_N = 5;
const BLUE = STATUS.info.solid;
const RED = STATUS.critical.solid;

type RankMode = 'high' | 'low';

interface ExpensesRankingProps {
  actorType: ActorType;
  items: RankItem[];
  average: number;
  onSelect: (entity: string) => void;
  title?: string;
  perVehicle?: boolean;
  carsByEntity?: Record<string, number>;
}

export function ExpensesRanking({
  actorType,
  items,
  average,
  onSelect,
  title,
  perVehicle,
  carsByEntity,
}: ExpensesRankingProps) {
  const actor = ACTORS[actorType];
  const [mode, setMode] = useState<RankMode>('high');

  const topItems = useMemo(() => {
    if (mode === 'high') return items.slice(0, TOP_N);
    return [...items].sort((a, b) => a.amount - b.amount).slice(0, TOP_N);
  }, [items, mode]);

  const scaleMax = Math.max(
    1,
    average,
    ...topItems.map((item) => item.amount)
  );
  const avgPct = Math.min((average / scaleMax) * 100, 100);

  return (
    <Card className="border-slate-200/80 shadow-sm">
      <CardHeader className="space-y-2 px-4 pb-2 pt-3 sm:px-5">
        <div className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-slate-800">
            {title ?? `Classement · ${actor.plural}`}
          </CardTitle>
          <span className="text-[11px] font-medium tabular-nums text-slate-400">
            Top {Math.min(TOP_N, topItems.length)}
            {items.length > TOP_N ? ` / ${items.length}` : ''}
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div
            className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 sm:w-auto"
            role="group"
            aria-label="Filtre classement"
          >
            <button
              type="button"
              onClick={() => setMode('high')}
              className={cn(
                'flex-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors sm:flex-none',
                mode === 'high'
                  ? 'bg-white text-red-700 shadow-sm ring-1 ring-red-200'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Plus consommatrices
            </button>
            <button
              type="button"
              onClick={() => setMode('low')}
              className={cn(
                'flex-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors sm:flex-none',
                mode === 'low'
                  ? 'bg-white text-blue-700 shadow-sm ring-1 ring-blue-200'
                  : 'text-slate-600 hover:text-slate-800'
              )}
            >
              Plus économes
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px]">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600">
              Moyenne {formatDT(average)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-medium text-blue-700">
              <span className="h-1.5 w-2.5 rounded-sm bg-blue-600" />
              ≤ moyenne
            </span>
            <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-1.5 py-0.5 font-medium text-red-700">
              <span className="h-1.5 w-2.5 rounded-sm bg-red-600" />
              &gt; moyenne
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-1.5 px-4 pb-3 pt-1 sm:px-5">
        {topItems.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-400">
            Aucune donnée pour ce classement
          </p>
        )}

        {topItems.map((item, idx) => {
          const meta = actorType === 'car' ? VEHICLE_META[item.entity] : null;
          const cars = carsByEntity?.[item.entity];
          const fillPct = Math.min((item.amount / scaleMax) * 100, 100);
          const bluePct = Math.min(avgPct, fillPct);
          const overPct = Math.max(fillPct - avgPct, 0);
          const above = average > 0 && item.amount > average;
          const deltaPct =
            average > 0
              ? Math.round((item.amount / average - 1) * 100)
              : 0;

          const subtitle = meta
            ? `${meta.icon} · ${meta.specialty}`
            : perVehicle && cars != null
              ? `${cars} véh.`
              : null;

          return (
            <button
              key={item.entity}
              type="button"
              onClick={() => onSelect(item.entity)}
              className={cn(
                'group relative flex w-full items-center gap-2 overflow-hidden rounded-lg border py-1.5 pl-3 pr-2 text-left transition-colors sm:gap-3 sm:pr-2.5',
                above
                  ? 'border-red-200 bg-red-50/70 hover:bg-red-50'
                  : 'border-blue-200 bg-blue-50/70 hover:bg-blue-50'
              )}
            >
              <span
                className={cn(
                  'absolute inset-y-0 left-0 w-1',
                  above ? 'bg-red-600' : 'bg-blue-600'
                )}
                aria-hidden
              />

              <span className="w-4 shrink-0 text-center text-[10px] font-semibold tabular-nums text-slate-400 sm:w-5 sm:text-[11px]">
                {String(idx + 1).padStart(2, '0')}
              </span>

              {actorType === 'car' && (
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/80 text-slate-600 ring-1 ring-slate-200/80">
                  <VehicleTypeIcon type={meta?.icon} />
                </span>
              )}
              {actorType === 'dep' && (
                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              )}
              {actorType === 'spe' && (
                <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              )}

              <span className="min-w-0 max-w-[38%] shrink truncate sm:max-w-[200px]">
                <span className="text-xs font-semibold text-slate-900 sm:text-sm">
                  {item.entity}
                </span>
                {subtitle && (
                  <span className="ml-1.5 hidden text-[10px] text-slate-500 sm:inline">
                    {subtitle}
                  </span>
                )}
              </span>

              <div className="relative mx-0.5 h-2 min-w-0 flex-1 overflow-visible rounded-full bg-white/80 ring-1 ring-black/5">
                <span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: `${bluePct}%`,
                    background: BLUE,
                    borderRadius:
                      overPct > 0 ? '9999px 0 0 9999px' : undefined,
                  }}
                />
                {overPct > 0 && (
                  <span
                    className="absolute inset-y-0 rounded-r-full"
                    style={{
                      left: `${avgPct}%`,
                      width: `${overPct}%`,
                      background: RED,
                    }}
                  />
                )}
                {average > 0 && (
                  <span
                    className="pointer-events-none absolute top-[-4px] bottom-[-4px] z-10 w-0 border-l-2 border-dashed border-slate-600"
                    style={{ left: `${avgPct}%` }}
                    title={`Moyenne · ${formatDT(average)}`}
                  />
                )}
              </div>

              <span className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold tabular-nums text-slate-900 sm:text-sm">
                  {formatDT(item.amount)}
                </span>
                {average > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold tabular-nums ring-1 ring-black/5',
                      above ? 'text-red-700' : 'text-blue-700'
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        above ? 'bg-red-600' : 'bg-blue-600'
                      )}
                    />
                    {deltaPct > 0 ? '+' : ''}
                    {deltaPct} %
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
