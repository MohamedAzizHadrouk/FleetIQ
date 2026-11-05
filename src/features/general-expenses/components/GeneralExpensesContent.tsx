import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ACTORS, GROUP_META } from '../constants';
import {
  computeExpenses,
  defaultEntities,
  defaultSubs,
} from '../lib/compute';
import type {
  DrawerView,
  ExpensesFiltersState,
  MaintMode,
  SubRubriqueKey,
} from '../types';
import { ExpensesBySubRubrique } from './ExpensesBySubRubrique';
import { ExpensesDetailSheet } from './ExpensesDetailSheet';
import { ExpensesFilters } from './ExpensesFilters';
import { ExpensesHeatmapTable } from './ExpensesHeatmapTable';
import { ExpensesKpiStrip } from './ExpensesKpiStrip';
import { ExpensesMonthlyChart } from './ExpensesMonthlyChart';
import { ExpensesRanking } from './ExpensesRanking';
import { SpecialtyAnalysis } from './SpecialtyAnalysis';

const INITIAL_FILTERS: ExpensesFiltersState = {
  actorType: 'car',
  period: 3,
  dateFrom: '2026/01/01 00:00:00',
  dateTo: '2026/09/23 23:59:59',
  compare: true,
  entities: defaultEntities('car'),
  subs: defaultSubs('car'),
};

export function GeneralExpensesContent() {
  const [filters, setFilters] = useState<ExpensesFiltersState>(INITIAL_FILTERS);
  const [drawer, setDrawer] = useState<DrawerView | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [maintMode, setMaintMode] = useState<MaintMode>('all');

  const data = useMemo(() => computeExpenses(filters), [filters]);
  const isGroup = filters.actorType === 'dep' || filters.actorType === 'spe';
  const actor = ACTORS[filters.actorType];

  const openDrawer = (view: DrawerView) => {
    setDrawer(view);
    setDrawerOpen(true);
  };

  const openEntity = (entity: string) => {
    if (isGroup) {
      openDrawer({ kind: 'dept', entity });
    } else {
      openDrawer({ kind: 'ops', sub: null, entity });
    }
  };

  const openFromKpi = (kind: 'sub' | 'ent', value: string) => {
    if (kind === 'sub') {
      openDrawer({ kind: 'ops', sub: value as SubRubriqueKey, entity: null });
    } else {
      openEntity(value);
    }
  };

  const openCell = (sub: SubRubriqueKey | null, entity: string | null) => {
    if (isGroup && !sub && entity) {
      openDrawer({ kind: 'dept', entity });
      return;
    }
    openDrawer({ kind: 'ops', sub, entity });
  };

  const groupKey =
    filters.actorType === 'dep' || filters.actorType === 'spe'
      ? filters.actorType
      : null;

  const perCarItems = useMemo(() => {
    if (!groupKey) return [];
    const cars = GROUP_META[groupKey].cars;
    return data.entities
      .map((e) => ({
        entity: e,
        amount: cars[e] ? (data.byEnt[e] || 0) / cars[e] : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [groupKey, data.entities, data.byEnt]);

  const perCarAvg = useMemo(() => {
    if (!groupKey) return 0;
    const cars = GROUP_META[groupKey].cars;
    const nAll = data.entities.reduce((a, e) => a + (cars[e] || 0), 0);
    return nAll ? data.total / nAll : 0;
  }, [groupKey, data.entities, data.total]);

  return (
    <div className="mx-auto w-full max-w-none space-y-4 px-3 pb-8 pt-3 sm:px-4 lg:px-5">
      <ExpensesFilters filters={filters} onChange={setFilters} />

      <ExpensesKpiStrip items={data.kpis} onAction={openFromKpi} />

      {groupKey ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ExpensesRanking
            actorType={filters.actorType}
            items={data.ranked}
            average={data.avg}
            onSelect={openEntity}
          />
          <ExpensesRanking
            actorType={filters.actorType}
            items={perCarItems}
            average={perCarAvg}
            onSelect={openEntity}
            title="Coût par véhicule"
            perVehicle
            carsByEntity={GROUP_META[groupKey].cars}
          />
        </div>
      ) : (
        <ExpensesRanking
          actorType={filters.actorType}
          items={data.ranked}
          average={data.avg}
          onSelect={openEntity}
          title={`Classement · ${actor.plural}`}
        />
      )}

      <Card className="border-slate-200/80 shadow-sm">
        <CardContent className="space-y-8 px-5 py-4">
          <ExpensesBySubRubrique
            actorType={filters.actorType}
            entities={data.entities}
            bySub={data.bySub}
            matrix={data.matrix}
            total={data.total}
            byEnt={data.byEnt}
          />

          {groupKey && data.speStats && (
            <SpecialtyAnalysis
              actorType={groupKey}
              stats={data.speStats}
              maintMode={maintMode}
              onMaintModeChange={setMaintMode}
              onOpenKm={(entity) => openDrawer({ kind: 'km', entity })}
              onOpenMaint={(entity) => openDrawer({ kind: 'maint', entity })}
              onOpenFuel={(entity) => openDrawer({ kind: 'fuel', entity })}
            />
          )}

          <ExpensesMonthlyChart
            actorType={filters.actorType}
            period={filters.period}
            entities={data.entities}
            subs={data.subs}
            byMonth={data.byMonth}
            byMonthEnt={data.byMonthEnt}
            byEnt={data.byEnt}
          />

          <ExpensesHeatmapTable
            actorType={filters.actorType}
            entities={data.entities}
            subs={data.subs}
            matrix={data.matrix}
            bySub={data.bySub}
            byEnt={data.byEnt}
            total={data.total}
            onCellClick={openCell}
          />
        </CardContent>
      </Card>

      <ExpensesDetailSheet
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        view={drawer}
        onViewChange={setDrawer}
        actorType={filters.actorType}
        selectedSubs={filters.subs}
        selectedEntities={filters.entities}
        speStats={data.speStats}
        maintMode={maintMode}
        onMaintModeChange={setMaintMode}
      />
    </div>
  );
}
