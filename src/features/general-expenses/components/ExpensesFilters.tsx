import { Check, ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { ACTORS, PERIOD_CUSTOM, PERIODS, SUBS } from '../constants';
import type {
  ActorType,
  ExpensesFiltersState,
  PeriodPreset,
  SubRubriqueKey,
} from '../types';
import { ExpensesExportMenu } from './ExpensesExportMenu';
import { ExpensesPeriodRangePicker } from './ExpensesPeriodRangePicker';

/** Period button labels (full words — never truncated). */
const PERIOD_LABEL: Record<(typeof PERIODS)[number], string> = {
  "Aujourd'hui": "Aujourd'hui",
  'Ce mois': 'Ce mois',
  Trimestre: 'Trimestre',
  'Année 2026': 'Année',
  Personnalisée: 'Personnalisée',
};

interface ExpensesFiltersProps {
  filters: ExpensesFiltersState;
  onChange: (next: ExpensesFiltersState) => void;
}

export function ExpensesFilters({ filters, onChange }: ExpensesFiltersProps) {
  const actor = ACTORS[filters.actorType];
  const [ddOpen, setDdOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ddRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ddRef.current?.contains(e.target as Node)) setDdOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (ddOpen) {
      setSearch('');
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [ddOpen, filters.actorType]);

  const setActor = (actorType: ActorType) => {
    onChange({
      ...filters,
      actorType,
      entities: [...ACTORS[actorType].entities],
      subs: Object.keys(ACTORS[actorType].subs) as SubRubriqueKey[],
    });
    setDdOpen(false);
  };

  const toggleEntity = (ent: string) => {
    const has = filters.entities.includes(ent);
    let next = has
      ? filters.entities.filter((e) => e !== ent)
      : [...filters.entities, ent];
    if (next.length === 0) next = [ent];
    onChange({ ...filters, entities: next });
  };

  const toggleAllEntities = () => {
    const all = actor.entities;
    onChange({
      ...filters,
      entities: filters.entities.length === all.length ? [all[0]] : [...all],
    });
  };

  const availableSubs = (Object.keys(SUBS) as SubRubriqueKey[]).filter(
    (key) => actor.subs[key]
  );

  const allSubsSelected =
    availableSubs.length > 0 &&
    availableSubs.every((key) => filters.subs.includes(key));

  const selectAllSubs = () => {
    onChange({
      ...filters,
      subs: [...availableSubs],
    });
  };

  const toggleSub = (key: SubRubriqueKey) => {
    if (!actor.subs[key]) return;

    if (allSubsSelected) {
      onChange({ ...filters, subs: [key] });
      return;
    }

    const has = filters.subs.includes(key);
    let next = has
      ? filters.subs.filter((s) => s !== key)
      : [...filters.subs, key];
    if (next.length === 0) next = [key];

    if (availableSubs.every((k) => next.includes(k))) {
      next = [...availableSubs];
    }

    onChange({ ...filters, subs: next });
  };

  const entityLabel =
    filters.entities.length === actor.entities.length
      ? `Tous (${actor.entities.length})`
      : `${filters.entities.length} / ${actor.entities.length}`;

  const filteredEntities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return actor.entities;
    return actor.entities.filter((e) => e.toLowerCase().includes(q));
  }, [actor.entities, search]);

  const chipClass = (on: boolean) =>
    cn(
      'inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all',
      on
        ? 'border-transparent bg-blue-600 text-white shadow-sm'
        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
    );

  return (
    <div className="sticky top-0 z-30 -mx-1 px-1 pb-1 pt-0.5">
      {/* Carte calée sur le contenu : plus de bande blanche vide */}
      <div className="w-full rounded-xl border border-slate-200/90 bg-white/95 shadow-md backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
        <div className="relative z-20 grid grid-cols-1 gap-2 px-2.5 py-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(11rem,0.85fr)_minmax(0,1.1fr)_auto] lg:items-center lg:gap-2.5">
          {/* Analyse : onglets + sélection — occupe l’espace */}
          <div className="flex min-w-0 items-center gap-2">
            <div
              className="flex min-w-0 flex-1 rounded-lg bg-slate-100/90 p-0.5"
              role="tablist"
              aria-label="Analyser par"
            >
              {(Object.keys(ACTORS) as ActorType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={filters.actorType === key}
                  onClick={() => setActor(key)}
                  className={cn(
                    'min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-center text-xs font-medium transition-all sm:text-sm',
                    filters.actorType === key
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {ACTORS[key].name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative min-w-0" ref={ddRef}>
            <button
              type="button"
              onClick={() => setDdOpen((o) => !o)}
              aria-expanded={ddOpen}
              aria-haspopup="listbox"
              className={cn(
                'inline-flex h-8 w-full items-center justify-between gap-2 rounded-lg border bg-white px-2.5 text-xs transition-colors sm:text-sm',
                ddOpen
                  ? 'border-blue-500 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              )}
            >
              <span className="truncate font-medium text-slate-700">
                {actor.plural}:{' '}
                <span className="font-normal text-slate-500">
                  {entityLabel}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform',
                  ddOpen && 'rotate-180'
                )}
              />
            </button>

            {ddOpen && (
              <div
                role="listbox"
                className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[260px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
              >
                <div className="border-b border-slate-100 p-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      ref={searchRef}
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Rechercher un ${actor.name.toLowerCase()}…`}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-8 pr-8 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-100"
                    />
                    {search && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        onClick={() => setSearch('')}
                        aria-label="Effacer la recherche"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                    onClick={toggleAllEntities}
                  >
                    {filters.entities.length === actor.entities.length
                      ? 'Tout désélectionner'
                      : 'Tout sélectionner'}
                  </button>
                  <span className="px-2 text-[11px] text-slate-400">
                    {filteredEntities.length} résultat
                    {filteredEntities.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto p-1.5">
                  {filteredEntities.length === 0 ? (
                    <p className="px-2 py-6 text-center text-sm text-slate-400">
                      Aucun résultat pour « {search} »
                    </p>
                  ) : (
                    filteredEntities.map((ent) => {
                      const checked = filters.entities.includes(ent);
                      return (
                        <button
                          key={ent}
                          type="button"
                          role="option"
                          aria-selected={checked}
                          className={cn(
                            'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                            checked
                              ? 'bg-blue-50 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          )}
                          onClick={() => toggleEntity(ent)}
                        >
                          <span
                            className={cn(
                              'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                              checked
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-slate-300 bg-white'
                            )}
                          >
                            {checked && <Check className="h-3 w-3" />}
                          </span>
                          <span className="truncate">{ent}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div
              className="flex min-w-0 rounded-lg bg-slate-100/90 p-0.5"
              role="group"
              aria-label="Période"
            >
              {PERIODS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  onClick={() =>
                    onChange({ ...filters, period: i as PeriodPreset })
                  }
                  className={cn(
                    'min-w-0 flex-1 truncate rounded-md px-1.5 py-1.5 text-center text-[11px] font-medium transition-all sm:px-2 sm:text-xs',
                    filters.period === i
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  {PERIOD_LABEL[label]}
                </button>
              ))}
            </div>

            {filters.period === PERIOD_CUSTOM && (
              <ExpensesPeriodRangePicker
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onChange={({ dateFrom, dateTo }) =>
                  onChange({ ...filters, dateFrom, dateTo })
                }
              />
            )}
          </div>

          <div className="justify-self-stretch lg:justify-self-end">
            <ExpensesExportMenu />
          </div>
        </div>

        {/* Grille qui remplit toute la largeur — plus de trou blanc à droite */}
        <div className="relative z-0 rounded-b-xl border-t border-slate-100 bg-slate-50/60 px-2.5 py-2">
          <div className="grid gap-1.5 [grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr))]">
            <button
              type="button"
              onClick={selectAllSubs}
              aria-pressed={allSubsSelected}
              className={chipClass(allSubsSelected)}
            >
              <span
                className={cn(
                  'inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full',
                  allSubsSelected ? 'bg-white/25' : 'bg-slate-100'
                )}
              >
                {allSubsSelected ? (
                  <Check className="h-2 w-2 text-white" strokeWidth={3} />
                ) : (
                  <span className="block h-1.5 w-1.5 rounded-full bg-slate-400" />
                )}
              </span>
              ALL
            </button>

            {availableSubs.map((key) => {
              const sub = SUBS[key];
              const on = !allSubsSelected && filters.subs.includes(key);
              const viaVehicle = actor.subs[key] === 'i';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSub(key)}
                  aria-pressed={on}
                  title={viaVehicle ? 'Rattaché via le véhicule' : sub.name}
                  className={chipClass(on)}
                >
                  <span
                    className={cn(
                      'inline-flex h-3 w-3 shrink-0 items-center justify-center rounded-full',
                      on ? 'bg-white/25' : 'bg-slate-100'
                    )}
                  >
                    {on ? (
                      <Check className="h-2 w-2 text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className="block h-1.5 w-1.5 rounded-full"
                        style={{ background: sub.color }}
                      />
                    )}
                  </span>
                  <span className="min-w-0 truncate">{sub.name}</span>
                  {viaVehicle && (
                    <span
                      className={cn(
                        'shrink-0 text-[9px]',
                        on ? 'text-white/80' : 'text-slate-400'
                      )}
                    >
                      ◐
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
