import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';
import { GROUP_META } from '../constants';
import {
  formatDT,
  formatL100,
  formatNumber,
  formatPerKm,
} from '../lib/format';
import {
  STATUS,
  STATUS_TEXT_CLASS,
  statusFromDeltaPct,
  statusFromOverRatio,
} from '../lib/status-colors';
import { fuelDetail, maintDone, maintPlan } from '../mock/expenses-mock';
import type { MaintMode, SpeStat } from '../types';

interface SpecialtyAnalysisProps {
  actorType: 'dep' | 'spe';
  stats: SpeStat[];
  onOpenKm: (entity: string) => void;
  onOpenMaint: (entity: string) => void;
  onOpenFuel: (entity: string) => void;
  maintMode: MaintMode;
  onMaintModeChange: (mode: MaintMode) => void;
}

export function SpecialtyAnalysis({
  actorType,
  stats,
  onOpenKm,
  onOpenMaint,
  onOpenFuel,
  maintMode,
  onMaintModeChange,
}: SpecialtyAnalysisProps) {
  const colors = GROUP_META[actorType].colors;
  const isSpe = actorType === 'spe';
  const label = actorType === 'dep' ? 'département' : 'spécialité';
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  const pieData = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.perKm - a.perKm)
        .map((x) => ({
          name: x.entity,
          value: x.perKm,
          km: x.km,
          fuel: x.fuel,
          color: colors[x.entity],
        })),
    [stats, colors]
  );

  const avgKm = useMemo(() => {
    const kmAll = stats.reduce((a, x) => a + x.km, 0);
    const totAll = stats.reduce((a, x) => a + x.fuel, 0);
    return kmAll ? totAll / kmAll : 0;
  }, [stats]);

  const entityKey = pieData.map((d) => d.name).join('|');

  // Default: highest coût/km; keep selection if still valid
  useEffect(() => {
    const names = entityKey ? entityKey.split('|') : [];
    setSelectedEntity((prev) =>
      prev && names.includes(prev) ? prev : names[0] ?? null
    );
  }, [actorType, entityKey]);

  const selectedStat = useMemo(
    () => stats.find((s) => s.entity === selectedEntity) ?? null,
    [stats, selectedEntity]
  );

  const selectedFuel = useMemo(() => {
    if (!selectedEntity) return null;
    return fuelDetail(actorType, selectedEntity);
  }, [actorType, selectedEntity]);

  const topVehicles = useMemo(() => {
    if (!selectedFuel || !selectedStat) return [];
    return selectedFuel.rows
      .map((r) => ({
        ...r,
        perKm: r.km ? (r.reel * r.price) / r.km : 0,
      }))
      .sort((a, b) => b.perKm - a.perKm)
      .slice(0, 4);
  }, [selectedFuel, selectedStat]);

  const selectEntity = (name: string) => {
    setSelectedEntity(name);
  };

  const maintRows = useMemo(() => {
    if (!isSpe) return [];
    return stats
      .map((x) => {
        const done = maintDone(x.entity, x.maint, actorType).filter(
          (o) => maintMode === 'all' || o.mode === maintMode
        );
        const plan = maintPlan(x.entity, actorType).filter(
          (q) => maintMode === 'all' || q.mode === maintMode
        );
        return {
          entity: x.entity,
          done: done.reduce((a, o) => a + o.amount, 0),
          planCount: plan.length,
          soon: plan.filter((q) => q.soon).length,
        };
      })
      .sort((a, b) => b.done - a.done);
  }, [stats, maintMode, actorType, isSpe]);

  const fuelRows = useMemo(() => {
    return [...stats]
      .map((x) => ({ entity: x.entity, detail: fuelDetail(actorType, x.entity) }))
      .sort((a, b) => b.detail.dt - a.detail.dt);
  }, [stats, actorType]);

  const maxDone = Math.max(1, ...maintRows.map((m) => m.done));
  const SC = 1.5;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">
        Analyse par {label}
      </h3>

      <div
        className={cn(
          'grid gap-3',
          isSpe ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}
      >
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-0 px-0 pb-1 pt-1">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Carburant / km
            </CardTitle>
            <p className="text-[11px] text-slate-400">
              sélectionnez un {label} pour le détail véhicules
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 px-0 pt-2 lg:grid-cols-[170px_minmax(170px,220px)_minmax(240px,1fr)] lg:items-start">
            <div className="relative mx-auto h-[170px] w-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={74}
                    paddingAngle={1}
                    onClick={(d) => d?.name && selectEntity(String(d.name))}
                    className="cursor-pointer"
                  >
                    {pieData.map((d) => (
                      <Cell
                        key={d.name}
                        fill={d.color}
                        opacity={
                          !selectedEntity || selectedEntity === d.name ? 1 : 0.35
                        }
                        stroke={
                          selectedEntity === d.name ? '#0f172a' : 'transparent'
                        }
                        strokeWidth={selectedEntity === d.name ? 2 : 0}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatPerKm(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold tabular-nums text-slate-900">
                  {(selectedStat?.perKm ?? avgKm).toFixed(2).replace('.', ',')}
                </span>
                <span className="max-w-[88px] text-center text-[10px] leading-tight text-slate-500">
                  {selectedStat
                    ? `${selectedStat.entity} · DT/km`
                    : 'DT/km carburant'}
                </span>
              </div>
            </div>

            <div className="grid gap-1">
              {pieData.map((d) => {
                const sum = pieData.reduce((a, x) => a + x.value, 0) || 1;
                const active = selectedEntity === d.name;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => selectEntity(d.name)}
                    className={cn(
                      'grid grid-cols-[12px_minmax(0,1fr)_auto] items-center gap-x-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
                      active
                        ? 'bg-slate-900 text-white'
                        : 'hover:bg-slate-50'
                    )}
                  >
                    <i
                      className="h-3 w-3 rounded-sm"
                      style={{ background: d.color }}
                    />
                    <span
                      className={cn(
                        'truncate font-semibold',
                        active ? 'text-white' : 'text-slate-800'
                      )}
                    >
                      {d.name}
                    </span>
                    <b
                      className={cn(
                        'tabular-nums',
                        active ? 'text-white' : 'text-slate-800'
                      )}
                    >
                      {formatPerKm(d.value)}
                    </b>
                    <small
                      className={cn(
                        'col-span-2 col-start-2 text-[11px]',
                        active ? 'text-slate-300' : 'text-slate-500'
                      )}
                    >
                      {d.km.toLocaleString('fr-FR')} km ·{' '}
                      {Math.round((d.value / sum) * 100)} %
                    </small>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[170px] p-1">
              {selectedStat && selectedFuel ? (
                <div className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Focus · {label}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        <span
                          className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-middle"
                          style={{ background: colors[selectedStat.entity] }}
                        />
                        {selectedStat.entity}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenKm(selectedStat.entity)}
                      className="shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium text-blue-600 hover:bg-slate-50"
                    >
                      Voir détail
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-500">
                        Carburant
                      </span>
                      <b className="text-sm tabular-nums text-slate-900">
                        {formatDT(selectedStat.fuel)}
                      </b>
                    </div>
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-500">Km</span>
                      <b className="text-sm tabular-nums text-slate-900">
                        {formatNumber(selectedStat.km)}
                      </b>
                    </div>
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-500">
                        vs moy.
                      </span>
                      <b
                        className={cn(
                          'text-sm tabular-nums',
                          STATUS_TEXT_CLASS[
                            statusFromDeltaPct(
                              avgKm
                                ? Math.round(
                                    (selectedStat.perKm / avgKm - 1) * 100
                                  )
                                : 0
                            )
                          ]
                        )}
                      >
                        {avgKm
                          ? `${selectedStat.perKm > avgKm ? '+' : ''}${Math.round(
                              (selectedStat.perKm / avgKm - 1) * 100
                            )} %`
                          : '—'}
                      </b>
                    </div>
                  </div>

                  {(selectedFuel.trop > 0 || selectedFuel.pct > 1) && (
                    <div
                      className="rounded-lg px-2.5 py-1.5 text-[11px]"
                      style={{
                        background:
                          STATUS[statusFromOverRatio(selectedFuel.pct)].soft,
                        border: `1px solid ${STATUS[statusFromOverRatio(selectedFuel.pct)].border}`,
                        color: STATUS[statusFromOverRatio(selectedFuel.pct)].text,
                      }}
                    >
                      Surconso. {formatL100(selectedFuel.est)} →{' '}
                      {formatL100(selectedFuel.real)} L/100 ·{' '}
                      <b>{formatDT(selectedFuel.dt)}</b>
                    </div>
                  )}

                  <div className="min-h-0 flex-1">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Top véhicules · coût / km
                    </p>
                    <div className="space-y-1">
                      {topVehicles.map((v) => (
                        <div
                          key={v.matricule}
                          className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1.5 text-xs"
                        >
                          <span className="min-w-0 truncate font-medium text-slate-700">
                            {v.matricule}
                            <span className="ml-1.5 font-normal text-slate-400">
                              {v.icon}
                            </span>
                          </span>
                          <span className="shrink-0 tabular-nums text-slate-800">
                            {formatPerKm(v.perKm)}
                          </span>
                        </div>
                      ))}
                      {topVehicles.length === 0 && (
                        <p className="text-xs text-slate-400">
                          Aucun véhicule pour ce {label}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col justify-center gap-3 text-sm text-slate-500">
                  <p className="font-medium text-slate-700">Vue parc</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-500">
                        Moyenne
                      </span>
                      <b className="tabular-nums text-slate-900">
                        {formatPerKm(avgKm)}
                      </b>
                    </div>
                    <div className="p-1">
                      <span className="block text-[10px] text-slate-500">
                        Km total
                      </span>
                      <b className="tabular-nums text-slate-900">
                        {formatNumber(stats.reduce((a, x) => a + x.km, 0))}
                      </b>
                    </div>
                  </div>
                  <p className="text-xs">
                    Cliquez un {label} pour afficher ses véhicules et le coût /
                    km.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isSpe && (
          <Card className="border-0 bg-transparent shadow-none">
            <CardHeader className="space-y-0 px-0 pb-1 pt-1">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Entretiens
              </CardTitle>
              <p className="text-[11px] text-slate-400">effectués et à venir</p>
            </CardHeader>
            <CardContent className="space-y-2 px-0 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ['all', 'Tous'],
                    ['km', 'Par kilométrage'],
                    ['h', 'Par heures moteur'],
                  ] as const
                ).map(([k, l]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => onMaintModeChange(k)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-xs font-medium',
                      maintMode === k
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {maintRows.map((m) => (
                <button
                  key={m.entity}
                  type="button"
                  onClick={() => onOpenMaint(m.entity)}
                  className="grid w-full grid-cols-[110px_1fr_190px] items-center gap-2.5 text-left text-sm hover:[&_.nm]:text-blue-600"
                >
                  <span className="nm flex items-center gap-1.5 font-medium">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-sm"
                      style={{ background: colors[m.entity] }}
                    />
                    {m.entity}
                  </span>
                  <div className="h-3.5 overflow-hidden rounded bg-slate-100">
                    <div
                      className="h-full rounded bg-blue-600"
                      style={{ width: `${(m.done / maxDone) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold tabular-nums">
                    {formatDT(m.done)}{' '}
                    <span className="text-[11px] font-medium text-slate-500">
                      {m.planCount} à venir
                      {m.soon > 0 && (
                        <>
                          {' '}
                          ·{' '}
                          <b className="text-orange-700">
                            {m.soon} bientôt
                          </b>
                        </>
                      )}
                    </span>
                  </span>
                </button>
              ))}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                  Coût des entretiens effectués
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-orange-600" />À faire bientôt
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {isSpe && (
          <Card className="border-0 bg-transparent shadow-none lg:col-span-2">
            <CardHeader className="space-y-0 px-0 pb-1 pt-1">
              <CardTitle className="text-sm font-semibold text-slate-800">
                Surconsommation carburant
              </CardTitle>
              <p className="text-[11px] text-slate-400">
                réel vs estimation (L/100 km)
              </p>
            </CardHeader>
            <CardContent className="space-y-2 px-0 pt-2">
              {fuelRows.map(({ entity, detail: F }) => {
                const p = Math.min(F.pct, SC);
                const overTone = statusFromOverRatio(F.pct);
                return (
                  <button
                    key={entity}
                    type="button"
                    onClick={() => onOpenFuel(entity)}
                    className="grid w-full grid-cols-[110px_1fr_190px] items-center gap-2.5 text-left text-sm hover:[&_.nm]:text-blue-600"
                  >
                    <span className="nm flex items-center gap-1.5 font-medium">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-sm"
                        style={{ background: colors[entity] }}
                      />
                      {entity}
                    </span>
                    <div className="relative h-3.5 overflow-visible rounded bg-slate-100">
                      <span
                        className="absolute rounded"
                        style={{
                          width: `${(Math.min(p, 1) / SC) * 100}%`,
                          top: 3,
                          bottom: 3,
                          left: 0,
                          background: STATUS.info.solid,
                        }}
                      />
                      {p > 1 && (
                        <span
                          className="absolute rounded-r"
                          style={{
                            left: `${100 / SC}%`,
                            width: `${((p - 1) / SC) * 100}%`,
                            top: 3,
                            bottom: 3,
                            background: STATUS[overTone].solid,
                          }}
                        />
                      )}
                      <span
                        className="absolute top-[-4px] bottom-[-4px] border-l-2 border-slate-400"
                        style={{ left: `${100 / SC}%` }}
                      />
                    </div>
                    <span className="text-right font-semibold tabular-nums">
                      {formatDT(F.dt)}{' '}
                      <span className="text-[11px] font-medium text-slate-500">
                        {formatL100(F.est)} → {formatL100(F.real)} L/100 km
                      </span>
                    </span>
                  </button>
                );
              })}
              <div className="flex flex-wrap gap-3 pt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-0.5 bg-slate-400" />
                  Estimation
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-blue-600" />
                  Consommation
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-orange-600" />
                  Attention
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-sm bg-red-600" />
                  Critique
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
