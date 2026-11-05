import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ExpensesPeriodRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onChange: (next: { dateFrom: string; dateTo: string }) => void;
}

const MONTH_NAMES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function parseDateTime(value: string): Date | null {
  if (!value) return null;
  try {
    const [datePart] = value.split(' ');
    const [year, month, day] = datePart.split('/').map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
  } catch {
    return null;
  }
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateFrom(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day} 00:00:00`;
}

function toDateTo(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day} 23:59:59`;
}

function formatShort(d: Date | null): string {
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${m}/${d.getFullYear()}`;
}

function sameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(day: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false;
  const t = startOfDay(day).getTime();
  const a = startOfDay(from).getTime();
  const b = startOfDay(to).getTime();
  return t > Math.min(a, b) && t < Math.max(a, b);
}

function daysInMonth(month: Date): (Date | null)[] {
  const year = month.getFullYear();
  const m = month.getMonth();
  const first = new Date(year, m, 1);
  // Monday-first: Sun=0 → 6, Mon=1 → 0, …
  const startPad = (first.getDay() + 6) % 7;
  const count = new Date(year, m + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= count; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function ExpensesPeriodRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: ExpensesPeriodRangePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const from = useMemo(() => parseDateTime(dateFrom), [dateFrom]);
  const to = useMemo(() => parseDateTime(dateTo), [dateTo]);

  const [draftFrom, setDraftFrom] = useState<Date | null>(from);
  const [draftTo, setDraftTo] = useState<Date | null>(to);
  const [picking, setPicking] = useState<'from' | 'to'>('from');
  const [month, setMonth] = useState<Date>(
    () => from ?? to ?? new Date(2026, 0, 1)
  );

  useEffect(() => {
    if (!open) return;
    setDraftFrom(from);
    setDraftTo(to);
    setPicking('from');
    setMonth(from ?? to ?? new Date(2026, 0, 1));
  }, [open, from, to]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const selectDay = (day: Date) => {
    if (picking === 'from' || !draftFrom || (draftFrom && draftTo)) {
      setDraftFrom(day);
      setDraftTo(null);
      setPicking('to');
      return;
    }
    // picking end
    if (day.getTime() < startOfDay(draftFrom).getTime()) {
      setDraftTo(draftFrom);
      setDraftFrom(day);
    } else {
      setDraftTo(day);
    }
    setPicking('from');
  };

  const apply = () => {
    if (!draftFrom || !draftTo) return;
    onChange({
      dateFrom: toDateFrom(draftFrom),
      dateTo: toDateTo(draftTo),
    });
    setOpen(false);
  };

  const summary =
    from && to ? `${formatShort(from)} – ${formatShort(to)}` : 'Choisir';

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Sélectionner la période"
        title={summary}
        className={cn(
          'inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg border px-2.5 text-sm transition-colors',
          open
            ? 'border-blue-300 bg-blue-50 text-blue-700 ring-2 ring-blue-100'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <Calendar className="h-4 w-4 shrink-0" />
        <span className="truncate text-xs font-medium tabular-nums">
          {summary}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-[300px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:left-auto sm:right-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2.5">
            <button
              type="button"
              onClick={() =>
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() - 1, 1)
                )
              }
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Mois précédent"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-slate-800">
              {MONTH_NAMES[month.getMonth()]} {month.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() =>
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() + 1, 1)
                )
              }
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label="Mois suivant"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="px-3 pt-2.5">
            <p className="mb-2 text-center text-[11px] text-slate-500">
              {picking === 'from' || !draftFrom
                ? 'Choisir la date de début'
                : 'Choisir la date de fin'}
            </p>
            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {DAY_NAMES.map((d) => (
                <div
                  key={d}
                  className="py-1 text-center text-[10px] font-semibold uppercase text-slate-400"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5 pb-2">
              {daysInMonth(month).map((day, i) => {
                if (!day) return <div key={`e-${i}`} />;
                const isStart = sameDay(day, draftFrom);
                const isEnd = sameDay(day, draftTo);
                const inRange = isBetween(day, draftFrom, draftTo);
                const isEdge = isStart || isEnd;
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => selectDay(day)}
                    className={cn(
                      'aspect-square rounded-lg text-xs font-medium transition-colors',
                      isEdge && 'bg-blue-600 text-white shadow-sm',
                      inRange && !isEdge && 'bg-blue-50 text-blue-800',
                      !isEdge && !inRange && 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/80 px-3 py-2.5">
            <span className="min-w-0 truncate text-xs tabular-nums text-slate-600">
              {formatShort(draftFrom)}
              <span className="mx-1 text-slate-300">→</span>
              {formatShort(draftTo)}
            </span>
            <button
              type="button"
              disabled={!draftFrom || !draftTo}
              onClick={apply}
              className="rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
