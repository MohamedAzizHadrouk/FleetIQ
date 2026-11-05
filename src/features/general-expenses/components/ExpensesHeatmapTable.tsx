import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACTORS, HEATMAP_PAGE_SIZE, SUBS } from '../constants';
import { heatIntensity } from '../lib/compute';
import { formatDT, matrixKey } from '../lib/format';
import type { ActorType, SubRubriqueKey } from '../types';

interface ExpensesHeatmapTableProps {
  actorType: ActorType;
  entities: string[];
  subs: SubRubriqueKey[];
  matrix: Record<string, number>;
  bySub: Record<SubRubriqueKey, number>;
  byEnt: Record<string, number>;
  total: number;
  onCellClick: (sub: SubRubriqueKey | null, entity: string | null) => void;
}

export function ExpensesHeatmapTable({
  actorType,
  entities,
  subs,
  matrix,
  bySub,
  byEnt,
  total,
  onCellClick,
}: ExpensesHeatmapTableProps) {
  const actor = ACTORS[actorType];
  const maxC = Math.max(1, ...Object.values(matrix));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(HEATMAP_PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [actorType, entities.join('|'), subs.join('|')]);

  const totalPages = Math.max(1, Math.ceil(entities.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageEntities = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return entities.slice(start, start + pageSize);
  }, [entities, safePage, pageSize]);

  return (
    <Card className="overflow-hidden border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-2 pt-1">
        <CardTitle className="text-sm font-semibold text-slate-800">
          Détail · {actor.name.toLowerCase()} × sous-rubrique
        </CardTitle>
        <span className="text-[11px] text-slate-400">
          {entities.length} {actor.plural.toLowerCase()} · page {safePage}/
          {totalPages}
        </span>
      </CardHeader>
      <CardContent className="px-0 pb-0 pt-1">
        <div className="max-h-[min(420px,55vh)] overflow-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 border-b border-slate-200 bg-white px-2.5 py-2.5 text-left text-[11px] font-medium text-slate-400">
                  {actor.name}
                </th>
                {subs.map((s) => (
                  <th
                    key={s}
                    className="border-b border-slate-200 bg-white px-2.5 py-2.5 text-right text-[11px] font-medium text-slate-400 whitespace-nowrap"
                  >
                    <span
                      className="mr-1.5 inline-block h-2 w-2 rounded-sm align-middle"
                      style={{ background: SUBS[s].color }}
                    />
                    {SUBS[s].name}
                    {actor.subs[s] === 'i' && (
                      <span className="ml-1 text-slate-400">◐</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {pageEntities.map((e) => (
                <tr key={e} className="border-b border-slate-100">
                  <td
                    role="button"
                    tabIndex={0}
                    onClick={() => onCellClick(null, e)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') onCellClick(null, e);
                    }}
                    className="sticky left-0 z-10 cursor-pointer whitespace-nowrap bg-white px-2.5 py-2 text-left font-medium text-slate-700 hover:bg-blue-50"
                    title={`${e} : toutes les sous-rubriques`}
                  >
                    {e}
                    <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-slate-400">
                      {formatDT(byEnt[e] || 0)}
                      {total
                        ? ` · ${Math.round(((byEnt[e] || 0) / total) * 100)} %`
                        : ''}
                    </span>
                  </td>
                  {subs.map((s) => {
                    const v = matrix[matrixKey(s, e)] || 0;
                    return (
                      <td
                        key={s}
                        role="button"
                        tabIndex={0}
                        onClick={() => onCellClick(s, e)}
                        onKeyDown={(ev) => {
                          if (ev.key === 'Enter') onCellClick(s, e);
                        }}
                        className="cursor-pointer px-2.5 py-2 text-right tabular-nums hover:outline hover:outline-2 hover:outline-offset-[-2px] hover:outline-blue-500"
                        style={{
                          background: `rgba(37,99,235,${heatIntensity(v, maxC).toFixed(3)})`,
                        }}
                      >
                        {formatDT(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>

            <tfoot className="sticky bottom-0 z-20">
              <tr className="border-t border-slate-200 font-semibold text-slate-800 shadow-[0_-4px_12px_-6px_rgba(15,23,42,0.12)]">
                <td className="sticky left-0 z-30 bg-slate-50 px-2.5 py-2.5 text-left">
                  Total
                  <span className="mt-0.5 block text-[11px] font-medium tabular-nums text-slate-500">
                    {formatDT(total)}
                  </span>
                </td>
                {subs.map((s) => (
                  <td
                    key={s}
                    role="button"
                    tabIndex={0}
                    onClick={() => onCellClick(s, null)}
                    onKeyDown={(ev) => {
                      if (ev.key === 'Enter') onCellClick(s, null);
                    }}
                    className="cursor-pointer bg-slate-50 px-2.5 py-2.5 text-right tabular-nums text-blue-600 underline decoration-dotted underline-offset-2 hover:bg-blue-50"
                    title={`${SUBS[s].name} : tous les ${actor.plural.toLowerCase()}`}
                  >
                    {formatDT(bySub[s] || 0)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-slate-100 font-medium text-slate-600">
                <td className="sticky left-0 z-30 bg-slate-50 px-2.5 py-2 text-left text-[11px] uppercase tracking-wide text-slate-400">
                  %
                </td>
                {subs.map((s) => (
                  <td
                    key={s}
                    className="bg-slate-50 px-2.5 py-2 text-right tabular-nums"
                  >
                    {total ? Math.round(((bySub[s] || 0) / total) * 100) : 0} %
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-0 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{actor.plural} / page</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md bg-transparent px-2 py-1 text-sm font-medium text-slate-700 outline-none ring-1 ring-slate-200"
            >
              {[5, 8, 10, 15].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="tabular-nums">
              {entities.length === 0
                ? '0'
                : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, entities.length)}`}{' '}
              sur {entities.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Page précédente"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="min-w-[3.5rem] text-center text-xs font-medium text-slate-500">
                {safePage} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Page suivante"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
