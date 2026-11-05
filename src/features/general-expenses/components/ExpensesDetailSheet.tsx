import { ArrowLeft, ChevronLeft, ChevronRight, Fuel, Truck, Wrench } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  ACTORS,
  FUEL_PRICES,
  GROUP_META,
  SPEC_COLORS,
  SUBS,
  VEHICLE_META,
} from '../constants';
import {
  formatDT,
  formatL100,
  formatNumber,
  formatPerKm,
  formatUnit,
} from '../lib/format';
import {
  buildOperations,
  depSplit,
  fuelDetail,
  maintDone,
  maintPlan,
} from '../mock/expenses-mock';
import type {
  ActorType,
  DrawerView,
  MaintMode,
  SpeStat,
  SubRubriqueKey,
} from '../types';

/** Fixed page size so the ops table keeps a stable height. */
const OPS_PAGE_SIZE = 8;

interface ExpensesDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: DrawerView | null;
  onViewChange: (view: DrawerView | null) => void;
  actorType: ActorType;
  selectedSubs: SubRubriqueKey[];
  selectedEntities: string[];
  speStats: SpeStat[] | null;
  maintMode: MaintMode;
  onMaintModeChange: (mode: MaintMode) => void;
}

export function ExpensesDetailSheet({
  open,
  onOpenChange,
  view,
  onViewChange,
  actorType,
  selectedSubs,
  selectedEntities,
  speStats,
  maintMode,
  onMaintModeChange,
}: ExpensesDetailSheetProps) {
  const content = useMemo(() => {
    if (!view) return null;

    if (view.kind === 'ops') {
      return (
        <OpsPanel
          actorType={actorType}
          sub={view.sub}
          entity={view.entity}
          selectedSubs={selectedSubs}
          selectedEntities={selectedEntities}
        />
      );
    }
    if (view.kind === 'dept') {
      return renderDept(actorType, view.entity, selectedSubs, (i) =>
        onViewChange({ kind: 'deptCar', entity: view.entity, vehicleIndex: i })
      );
    }
    if (view.kind === 'deptCar') {
      return renderDeptCar(
        actorType,
        view.entity,
        view.vehicleIndex,
        selectedSubs,
        () => onViewChange({ kind: 'dept', entity: view.entity })
      );
    }
    if (view.kind === 'km') {
      return renderKm(actorType, view.entity, selectedSubs, (i) =>
        onViewChange({
          kind: 'deptCar',
          entity: view.entity,
          vehicleIndex: i,
        })
      );
    }
    if (view.kind === 'fuel') {
      return renderFuel(actorType, view.entity);
    }
    if (view.kind === 'maint') {
      return renderMaint(
        actorType,
        view.entity,
        speStats,
        maintMode,
        onMaintModeChange
      );
    }
    return null;
  }, [
    view,
    actorType,
    selectedSubs,
    selectedEntities,
    speStats,
    maintMode,
    onMaintModeChange,
    onViewChange,
  ]);

  const title = viewTitle(view, actorType);
  const subtitle = viewSubtitle(view, actorType);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-hidden p-0 sm:max-w-xl lg:max-w-2xl">
        <SheetHeader className="border-b border-slate-200 px-5 py-4 text-left">
          <SheetTitle className="text-base">{title}</SheetTitle>
          {subtitle && (
            <SheetDescription className="text-xs">{subtitle}</SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-5 py-4">{content}</div>
      </SheetContent>
    </Sheet>
  );
}

function viewTitle(view: DrawerView | null, actorType: ActorType): string {
  if (!view) return 'Détail';
  if (view.kind === 'ops') {
    return `${view.sub ? SUBS[view.sub].name : 'Toutes sous-rubriques'}${
      view.entity ? ` · ${view.entity}` : ''
    }`;
  }
  if (view.kind === 'dept') return `${ACTORS[actorType].name} ${view.entity}`;
  if (view.kind === 'deptCar') {
    const D = depSplit(
      actorType as 'dep' | 'spe',
      view.entity,
      Object.keys(SUBS) as SubRubriqueKey[]
    );
    const v = D.veh[view.vehicleIndex];
    return v ? v.matricule : 'Véhicule';
  }
  if (view.kind === 'km') return `Coût du carburant par km · ${view.entity}`;
  if (view.kind === 'fuel') return `Surconsommation carburant · ${view.entity}`;
  if (view.kind === 'maint') return `Entretiens · ${view.entity}`;
  return 'Détail';
}

function viewSubtitle(view: DrawerView | null, _actorType: ActorType): string {
  if (!view) return '';
  // No technical source line in the sheet header (ops / dept)
  if (view.kind === 'ops') return '';
  if (view.kind === 'dept') return '';
  if (view.kind === 'km') {
    return 'dépenses Carburant/Coupons + km des missions et locations';
  }
  if (view.kind === 'fuel') {
    return 'CarRental.FuelConsumedLiters, Car.FuelEstimation, Car.FuelType';
  }
  if (view.kind === 'maint') {
    return 'CarRepairHistory (effectués), CarMaintenance (à venir)';
  }
  return '';
}

function SpecBadge({ name }: { name: string }) {
  return (
    <span className="text-sm font-medium text-slate-700">{name}</span>
  );
}

function OpsPanel({
  actorType,
  sub,
  entity,
  selectedSubs,
  selectedEntities,
}: {
  actorType: ActorType;
  sub: SubRubriqueKey | null;
  entity: string | null;
  selectedSubs: SubRubriqueKey[];
  selectedEntities: string[];
}) {
  const actor = ACTORS[actorType];
  const [page, setPage] = useState(0);

  const rows = useMemo(() => {
    const subs = sub
      ? [sub]
      : selectedSubs.filter((k) => actor.subs[k]);
    const ents = entity
      ? [entity]
      : actor.entities.filter((e) => selectedEntities.includes(e));
    return buildOperations(actorType, subs, ents);
  }, [actorType, sub, entity, selectedSubs, selectedEntities, actor]);

  const total = rows.reduce((a, r) => a + r.amount, 0);
  const noSupplier =
    actorType === 'drv' || actorType === 'dep' || actorType === 'spe';
  const isCar = actorType === 'car';
  const spOf = (e: string) => VEHICLE_META[e]?.specialty ?? '—';

  const pageCount = Math.max(1, Math.ceil(rows.length / OPS_PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [actorType, sub, entity, selectedSubs, selectedEntities]);

  useEffect(() => {
    if (page > pageCount - 1) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  const pagedRows = rows.slice(
    page * OPS_PAGE_SIZE,
    page * OPS_PAGE_SIZE + OPS_PAGE_SIZE
  );

  let specHtml: ReactNode = null;
  if (isCar && !entity) {
    const by: Record<string, number> = {};
    rows.forEach((r) => {
      const sp = spOf(r.entity);
      by[sp] = (by[sp] || 0) + r.amount;
    });
    const arr = Object.entries(by).sort((a, b) => b[1] - a[1]);
    const mx = arr[0]?.[1] || 1;
    const tot = total || 1;
    specHtml = (
      <div className="mb-3 rounded-lg border border-slate-200 p-3">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Répartition par spécialité
        </h4>
        {arr.map(([sp, v]) => (
          <div
            key={sp}
            className="mb-1 grid grid-cols-[90px_1fr_130px] items-center gap-2 text-xs"
          >
            <SpecBadge name={sp} />
            <span className="h-2 overflow-hidden rounded bg-slate-100">
              <i
                className="block h-full"
                style={{
                  width: `${(v / mx) * 100}%`,
                  background: SPEC_COLORS[sp] || '#64748b',
                }}
              />
            </span>
            <span className="text-right tabular-nums">
              {formatDT(v)} · {Math.round((v / tot) * 100)} %
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-700">
        <b>{rows.length}</b> opération{rows.length > 1 ? 's' : ''} ·{' '}
        <b>{formatDT(total)}</b>
        {isCar && entity && (
          <>
            {' '}
            · Spécialité : <SpecBadge name={spOf(entity)} />
          </>
        )}
      </p>
      {specHtml}
      <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase text-slate-500">
                <th className="px-3 py-2.5 pr-2">Date</th>
                <th className="py-2.5 pr-2">Réf.</th>
                <th className="py-2.5 pr-2">Sous-rubrique</th>
                {!entity && <th className="py-2.5 pr-2">{actor.name}</th>}
                {!noSupplier && (
                  <th className="py-2.5 pr-2">
                    {isCar ? 'Spécialité' : 'Fournisseur'}
                  </th>
                )}
                <th className="px-3 py-2.5 text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {pagedRows.map((r) => (
                <tr
                  key={`${r.ref}-${r.date}-${r.amount}`}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="whitespace-nowrap px-3 py-2.5 pr-2">
                    {r.date}
                  </td>
                  <td className="py-2.5 pr-2 text-slate-500">{r.ref}</td>
                  <td className="py-2.5 pr-2">{SUBS[r.sub].name}</td>
                  {!entity && <td className="py-2.5 pr-2">{r.entity}</td>}
                  {!noSupplier && (
                    <td className="py-2.5 pr-2">
                      {isCar ? (
                        <SpecBadge name={spOf(r.entity)} />
                      ) : (
                        r.supplier
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                    {formatDT(r.amount)}
                  </td>
                </tr>
              ))}
              {/* Keep table height stable when last page is short */}
              {pagedRows.length < OPS_PAGE_SIZE &&
                Array.from({
                  length: OPS_PAGE_SIZE - pagedRows.length,
                }).map((_, i) => (
                  <tr key={`pad-${i}`} aria-hidden className="border-0">
                    <td
                      colSpan={
                        3 +
                        (entity ? 0 : 1) +
                        (noSupplier ? 0 : 1) +
                        1
                      }
                      className="h-[42px] px-3"
                    />
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50/80 px-3 py-2">
            <span className="text-[11px] tabular-nums text-slate-500">
              {page * OPS_PAGE_SIZE + 1}–
              {Math.min((page + 1) * OPS_PAGE_SIZE, rows.length)} /{' '}
              {rows.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Page précédente"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                  page === 0
                    ? 'cursor-not-allowed border-slate-100 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-[3.5rem] text-center text-[11px] font-medium tabular-nums text-slate-600">
                {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                aria-label="Page suivante"
                disabled={page >= pageCount - 1}
                onClick={() =>
                  setPage((p) => Math.min(pageCount - 1, p + 1))
                }
                className={cn(
                  'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
                  page >= pageCount - 1
                    ? 'cursor-not-allowed border-slate-100 text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function renderDept(
  actorType: ActorType,
  entity: string,
  selectedSubs: SubRubriqueKey[],
  onVehicle: (i: number) => void
) {
  if (actorType !== 'dep' && actorType !== 'spe') return null;
  const D = depSplit(actorType, entity, selectedSubs);
  const tot = D.vehTot + D.otherTot || 1;
  const G = GROUP_META[actorType];
  const isSpe = actorType === 'spe';

  return (
    <div className="space-y-3">
      <p className="text-sm">
        <b>{formatDT(tot)}</b> sur la période · véhicules {formatDT(D.vehTot)}
        {D.otherTot ? ` · achats ${formatDT(D.otherTot)}` : ''}
      </p>
      <p className="text-xs text-slate-500">
        {D.veh.length} véhicules · source : {G.src}
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] uppercase text-slate-500">
            <th className="py-2">Véhicule</th>
            <th className="py-2 text-right">Montant</th>
            <th className="py-2 text-right">{G.pct}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {D.veh.map((v, i) => (
            <tr
              key={v.matricule}
              className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              onClick={() => onVehicle(i)}
            >
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                    <Truck className="h-3.5 w-3.5 text-slate-500" />
                  </span>
                  <span>
                    <b className="block">{v.matricule}</b>
                    <small className="text-slate-500">
                      {v.icon} · {isSpe ? `Département ${v.department}` : v.specialty}
                    </small>
                  </span>
                </div>
              </td>
              <td className="py-2 text-right font-bold tabular-nums">
                {formatDT(v.tot)}
              </td>
              <td className="py-2 text-right">
                <span className="mr-1.5 inline-block h-1.5 w-12 overflow-hidden rounded bg-slate-100 align-middle">
                  <i
                    className="block h-full bg-teal-600"
                    style={{
                      width: `${(v.tot / (D.veh[0]?.tot || 1)) * 100}%`,
                    }}
                  />
                </span>
                {Math.round((v.tot / tot) * 100)} %
              </td>
              <td className="py-2 text-slate-400">›</td>
            </tr>
          ))}
          {D.otherTot > 0 && (
            <tr className="border-b border-slate-100 text-slate-500">
              <td className="py-2">
                <b>Achats</b>
                <small className="block">
                  {Object.keys(D.other)
                    .map((s) => SUBS[s as SubRubriqueKey].name)
                    .join(' + ')}{' '}
                  · non rattachés à un véhicule
                </small>
              </td>
              <td className="py-2 text-right font-bold">{formatDT(D.otherTot)}</td>
              <td className="py-2 text-right">
                {Math.round((D.otherTot / tot) * 100)} %
              </td>
              <td />
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-slate-500">
        Cliquez un véhicule pour voir le détail de ses dépenses.
      </p>
    </div>
  );
}

function renderDeptCar(
  actorType: ActorType,
  entity: string,
  vehicleIndex: number,
  selectedSubs: SubRubriqueKey[],
  onBack: () => void
) {
  if (actorType !== 'dep' && actorType !== 'spe') return null;
  const D = depSplit(actorType, entity, selectedSubs);
  const v = D.veh[vehicleIndex];
  if (!v) return null;
  const parts = Object.entries(v.subs).sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const mx = parts[0]?.[1] || 1;
  const opRows: { date: string; sub: SubRubriqueKey; amount: number; ref: string }[] = [];
  parts.forEach(([s, a0]) => {
    const a = a0 || 0;
    const built = buildOperations('car', [s as SubRubriqueKey], [v.matricule]);
    if (built.length) {
      const sum = built.reduce((x, r) => x + r.amount, 0) || 1;
      built.forEach((r) => {
        opRows.push({
          date: r.date,
          sub: r.sub,
          amount: Math.round((a * r.amount) / sum),
          ref: r.ref,
        });
      });
    } else {
      opRows.push({
        date: '01/01/2026',
        sub: s as SubRubriqueKey,
        amount: a,
        ref: `REF-${s}`,
      });
    }
  });
  opRows.sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Retour à {entity}
      </Button>
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Truck className="h-4 w-4" />
        {v.icon} · <SpecBadge name={v.specialty} /> · Département {v.department}
      </div>
      <p className="text-sm">
        <b>{formatDT(v.tot)}</b> sur la période · {opRows.length} opération
        {opRows.length > 1 ? 's' : ''}
      </p>
      <div className="rounded-lg border border-slate-200 p-3">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
          Répartition par sous-rubrique
        </h4>
        {parts.map(([s, a]) => (
          <div
            key={s}
            className="mb-1 grid grid-cols-[130px_1fr_130px] items-center gap-2 text-xs"
          >
            <span>{SUBS[s as SubRubriqueKey].name}</span>
            <span className="h-2 overflow-hidden rounded bg-slate-100">
              <i
                className="block h-full"
                style={{
                  width: `${((a || 0) / mx) * 100}%`,
                  background: SUBS[s as SubRubriqueKey].color,
                }}
              />
            </span>
            <span className="text-right tabular-nums">
              {formatDT(a || 0)} · {Math.round(((a || 0) / v.tot) * 100)} %
            </span>
          </div>
        ))}
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] uppercase text-slate-500">
            <th className="py-2">Date</th>
            <th className="py-2">Réf.</th>
            <th className="py-2">Sous-rubrique</th>
            <th className="py-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {opRows.map((r) => (
            <tr key={`${r.ref}-${r.sub}`} className="border-b border-slate-100">
              <td className="py-2">{r.date}</td>
              <td className="py-2 text-slate-500">{r.ref}</td>
              <td className="py-2">{SUBS[r.sub].name}</td>
              <td className="py-2 text-right font-semibold tabular-nums">
                {formatDT(r.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderKm(
  actorType: ActorType,
  entity: string,
  selectedSubs: SubRubriqueKey[],
  onVehicle: (i: number) => void
) {
  if (actorType !== 'dep' && actorType !== 'spe') return null;
  const D = depSplit(actorType, entity, selectedSubs);
  const F = fuelDetail(actorType, entity);
  const kmOf = Object.fromEntries(F.rows.map((r) => [r.matricule, r.km]));
  const rows = D.veh
    .map((v, i) => ({
      ...v,
      i,
      km: kmOf[v.matricule] || 0,
      fuel: v.subs.fuel || 0,
    }))
    .map((v) => ({ ...v, perKm: v.km ? v.fuel / v.km : 0 }))
    .sort((a, b) => b.perKm - a.perKm);
  const tot = rows.reduce((a, v) => a + v.fuel, 0);
  const km = rows.reduce((a, v) => a + v.km, 0);
  const avg = km ? tot / km : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Dépenses carburant</span>
          <b className="text-base tabular-nums">{formatDT(tot)}</b>
        </div>
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Km parcourus</span>
          <b className="text-base tabular-nums">{formatNumber(km)} km</b>
        </div>
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Coût / km</span>
          <b className="text-base tabular-nums">{formatPerKm(avg)}</b>
        </div>
      </div>
      <div className="rounded-lg border border-indigo-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed text-slate-700">
        Coût du carburant par km = Dépenses carburant ÷ Km parcourus
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-[11px] uppercase text-slate-500">
            <th className="py-2">Véhicule</th>
            <th className="py-2 text-right">Km</th>
            <th className="py-2 text-right">Carburant</th>
            <th className="py-2 text-right">Coût / km</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr
              key={v.matricule}
              className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
              onClick={() => onVehicle(v.i)}
            >
              <td className="py-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-slate-400" />
                  <span>
                    <b className="block">{v.matricule}</b>
                    <small className="text-slate-500">
                      {v.icon} ·{' '}
                      {actorType === 'dep'
                        ? v.specialty
                        : `Département ${v.department}`}
                    </small>
                  </span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums">
                {formatNumber(v.km)} km
              </td>
              <td className="py-2 text-right tabular-nums">{formatDT(v.fuel)}</td>
              <td
                className={cn(
                  'py-2 text-right tabular-nums',
                  v.perKm > avg * 1.15 && 'font-bold text-orange-700'
                )}
              >
                {formatPerKm(v.perKm)}
              </td>
              <td className="py-2 text-slate-400">›</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-500">
        En rouge : plus de 15 % au-dessus du coût moyen. Cliquez un véhicule pour
        le détail.
      </p>
    </div>
  );
}

function renderFuel(actorType: ActorType, entity: string) {
  if (actorType !== 'dep' && actorType !== 'spe') return null;
  const F = fuelDetail(actorType, entity);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Fuel className="h-4 w-4" />
        {F.rows.length} véhicules
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Estimation moyenne</span>
          <b>{formatL100(F.est)} L/100</b>
        </div>
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Consommation réelle</span>
          <b>{formatL100(F.real)} L/100</b>
        </div>
        <div
          className={cn(
            'rounded-lg border border-slate-200 p-2.5',
            F.trop && '[&_b]:text-orange-700'
          )}
        >
          <span className="block text-[11px] text-slate-500">Litres en trop</span>
          <b>{formatNumber(F.trop)} L</b>
        </div>
        <div
          className={cn(
            'rounded-lg border border-slate-200 p-2.5',
            F.dt && '[&_b]:text-orange-700'
          )}
        >
          <span className="block text-[11px] text-slate-500">Argent perdu</span>
          <b>{formatDT(F.dt)}</b>
        </div>
      </div>
      <div className="rounded-lg border border-indigo-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed">
        Surconsommation = réelle − estimation · Litres en trop = écart × km ÷ 100
        <br />
        Prix : Diesel {FUEL_PRICES.Diesel.toFixed(3).replace('.', ',')} DT/L ·
        Essence {FUEL_PRICES.Essence.toFixed(3).replace('.', ',')} DT/L
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-left uppercase text-slate-500">
              <th className="py-2">Véhicule</th>
              <th className="py-2 text-right">km</th>
              <th className="py-2 text-right">L/100 estimé → réel</th>
              <th className="py-2 text-right">Écart</th>
              <th className="py-2 text-right">En trop</th>
              <th className="py-2 text-right">Perdu</th>
            </tr>
          </thead>
          <tbody>
            {F.rows.map((v) => (
              <tr key={v.matricule} className="border-b border-slate-100">
                <td className="py-2">
                  <b className="block">{v.matricule}</b>
                  <small className="text-slate-500">
                    {v.icon} ·{' '}
                    <Badge
                      variant={v.fuel === 'Diesel' ? 'info' : 'medium'}
                      className="text-[10px]"
                    >
                      {v.fuel}
                    </Badge>
                  </small>
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatNumber(v.km)}
                </td>
                <td className="py-2 text-right tabular-nums">
                  {formatL100(v.est)} → {formatL100(v.real)}
                </td>
                <td
                  className={cn(
                    'py-2 text-right',
                    v.gap ? 'font-bold text-orange-700' : 'text-green-700'
                  )}
                >
                  {v.gap ? `+${formatL100(v.gap)}` : 'conforme'}
                </td>
                <td
                  className={cn(
                    'py-2 text-right',
                    v.trop ? 'font-bold text-orange-700' : 'text-green-700'
                  )}
                >
                  {v.trop ? `${formatNumber(v.trop)} L` : '0 L'}
                </td>
                <td
                  className={cn(
                    'py-2 text-right',
                    v.dt ? 'font-bold text-orange-700' : 'text-green-700'
                  )}
                >
                  {formatDT(v.dt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderMaint(
  actorType: ActorType,
  entity: string,
  speStats: SpeStat[] | null,
  maintMode: MaintMode,
  onMaintModeChange: (mode: MaintMode) => void
) {
  const x = (speStats || []).find((s) => s.entity === entity);
  if (!x) return null;
  const keep = <T extends { mode: 'km' | 'h' }>(o: T) =>
    maintMode === 'all' || o.mode === maintMode;
  const done = maintDone(entity, x.maint, actorType).filter(keep);
  const plan = maintPlan(entity, actorType).filter(keep);
  const soon = plan.filter((q) => q.soon).length;
  const doneSum = done.reduce((a, o) => a + o.amount, 0);
  const all = maintMode === 'all';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Wrench className="h-4 w-4" />
        Entretiens · {entity}
      </div>
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
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">Effectués</span>
          <b>{formatDT(doneSum)}</b>
        </div>
        <div className="rounded-lg border border-slate-200 p-2.5">
          <span className="block text-[11px] text-slate-500">À venir</span>
          <b>{plan.length}</b>
        </div>
        <div
          className={cn(
            'rounded-lg border border-slate-200 p-2.5',
            soon && '[&_b]:text-orange-700'
          )}
        >
          <span className="block text-[11px] text-slate-500">Bientôt</span>
          <b>{soon}</b>
        </div>
      </div>
      <h4 className="text-sm font-semibold">Entretiens effectués</h4>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left uppercase text-slate-500">
            <th className="py-2">Date</th>
            <th className="py-2">Véhicule</th>
            <th className="py-2">Type</th>
            {all && <th className="py-2">Planning</th>}
            <th className="py-2 text-right">Montant</th>
          </tr>
        </thead>
        <tbody>
          {done.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-3 text-slate-500">
                Aucun entretien effectué de ce type sur la période.
              </td>
            </tr>
          ) : (
            done.map((o) => (
              <tr key={o.ref} className="border-b border-slate-100">
                <td className="py-2">{o.date}</td>
                <td className="py-2">{o.matricule}</td>
                <td className="py-2">{o.type}</td>
                {all && (
                  <td className="py-2">
                    <Badge variant={o.mode === 'h' ? 'medium' : 'info'}>
                      {o.mode === 'h' ? 'Heures moteur' : 'Kilométrage'}
                    </Badge>
                  </td>
                )}
                <td className="py-2 text-right font-semibold">
                  {formatDT(o.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <h4 className="text-sm font-semibold">Prochains entretiens planifiés</h4>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-left uppercase text-slate-500">
            <th className="py-2">Véhicule</th>
            <th className="py-2">Type</th>
            <th className="py-2">Actuel</th>
            <th className="py-2">Prochain</th>
            <th className="py-2 text-right">Restant</th>
          </tr>
        </thead>
        <tbody>
          {plan.map((q) => (
            <tr
              key={`${q.matricule}-${q.type}-${q.next}`}
              className="border-b border-slate-100"
            >
              <td className="py-2">{q.matricule}</td>
              <td className="py-2">
                {q.type}
                <small className="block text-slate-500">
                  tous les {formatUnit(q.every, q.mode)}
                </small>
              </td>
              <td className="py-2">{formatUnit(q.cur, q.mode)}</td>
              <td className="py-2">{formatUnit(q.next, q.mode)}</td>
              <td
                className={cn(
                  'py-2 text-right',
                  q.soon && 'font-bold text-orange-700'
                )}
              >
                {formatUnit(q.left, q.mode)}
                {q.soon && (
                  <small className="block">
                    bientôt (≤ {formatUnit(q.warn, q.mode)})
                  </small>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
