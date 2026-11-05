import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertPeriodPickerButtonProps {
  dateFrom?: string;
  dateTo?: string;
  onChange: (range: { dateFrom?: string; dateTo?: string }) => void;
  variant?: 'dark' | 'light';
}

const WEEKDAYS = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseIsoDate(iso?: string): Date | null {
  if (!iso) return null;
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDisplayDate(iso: string): string {
  const date = parseIsoDate(iso);
  if (!date) return iso;
  return date.toLocaleDateString('fr-FR');
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isInRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false;
  const time = date.getTime();
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate()).getTime();
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate()).getTime();
  return time >= start && time <= end;
}

export function AlertPeriodPickerButton({
  dateFrom,
  dateTo,
  onChange,
  variant = 'light',
}: AlertPeriodPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const [draftFrom, setDraftFrom] = useState<string | undefined>(dateFrom);
  const [draftTo, setDraftTo] = useState<string | undefined>(dateTo);
  const [currentMonth, setCurrentMonth] = useState(() => parseIsoDate(dateFrom) ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftFrom(dateFrom);
    setDraftTo(dateTo);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    return cells;
  }, [currentMonth]);

  const fromDate = parseIsoDate(draftFrom);
  const toDate = parseIsoDate(draftTo);
  const today = new Date();
  const hasRange = Boolean(dateFrom && dateTo);
  const isLight = variant === 'light';

  const handleSelect = (date: Date) => {
    const iso = toIsoDate(date);
    if (!selectingEnd || !draftFrom) {
      setDraftFrom(iso);
      setDraftTo(undefined);
      setSelectingEnd(true);
      return;
    }

    const start = parseIsoDate(draftFrom)!;
    if (date < start) {
      setDraftFrom(iso);
      setDraftTo(draftFrom);
    } else {
      setDraftTo(iso);
    }
    setSelectingEnd(false);
  };

  const applyRange = () => {
    if (draftFrom && draftTo) {
      onChange({ dateFrom: draftFrom, dateTo: draftTo });
      setOpen(false);
    }
  };

  const clearRange = () => {
    setDraftFrom(undefined);
    setDraftTo(undefined);
    setSelectingEnd(false);
    onChange({ dateFrom: undefined, dateTo: undefined });
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="icon"
        title={
          hasRange
            ? `Période : ${formatDisplayDate(dateFrom!)} — ${formatDisplayDate(dateTo!)}`
            : 'Sélectionner une période'
        }
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'h-9 w-9',
          isLight
            ? hasRange
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 text-slate-600'
            : hasRange
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'border-slate-600 text-slate-400 hover:bg-slate-800 hover:text-white'
        )}
      >
        <Calendar className="h-4 w-4" />
      </Button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-2 z-50 w-72 rounded-lg border shadow-xl p-3',
            isLight ? 'border-slate-200 bg-white' : 'border-slate-600 bg-slate-800'
          )}
        >
          <p
            className={cn(
              'text-xs mb-2',
              isLight ? 'text-muted-foreground' : 'text-slate-400'
            )}
          >
            {selectingEnd && draftFrom
              ? 'Sélectionnez la date de fin'
              : 'Sélectionnez la date de début'}
          </p>

          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }
              className={cn(
                'p-1 rounded',
                isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-700 text-slate-300'
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span
              className={cn(
                'text-xs font-semibold capitalize',
                isLight ? 'text-slate-800' : 'text-slate-200'
              )}
            >
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }
              className={cn(
                'p-1 rounded',
                isLight ? 'hover:bg-slate-100 text-slate-600' : 'hover:bg-slate-700 text-slate-300'
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className={cn(
                  'text-[10px] text-center font-medium',
                  isLight ? 'text-slate-500' : 'text-slate-500'
                )}
              >
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, idx) =>
              date ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={cn(
                    'h-8 w-8 rounded-md text-xs font-medium transition-colors',
                    draftFrom && isSameDay(date, fromDate!)
                      ? 'bg-blue-600 text-white'
                      : draftTo && isSameDay(date, toDate!)
                        ? 'bg-blue-600 text-white'
                        : isInRange(date, fromDate, toDate)
                          ? 'bg-blue-100 text-blue-800'
                          : isSameDay(date, today)
                            ? isLight
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-slate-700 text-slate-100'
                            : isLight
                              ? 'text-slate-700 hover:bg-slate-100'
                              : 'text-slate-300 hover:bg-slate-700'
                  )}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={idx} />
              )
            )}
          </div>

          {draftFrom && (
            <p className={cn('text-xs mt-2', isLight ? 'text-slate-600' : 'text-slate-300')}>
              {draftTo
                ? `${formatDisplayDate(draftFrom)} — ${formatDisplayDate(draftTo)}`
                : `Début : ${formatDisplayDate(draftFrom)}`}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            <Button
              type="button"
              size="sm"
              className="flex-1 h-8 text-xs"
              disabled={!draftFrom || !draftTo}
              onClick={applyRange}
            >
              Appliquer
            </Button>
            {hasRange && (
              <button
                type="button"
                onClick={clearRange}
                className={cn(
                  'flex items-center gap-1 text-xs px-2',
                  isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200'
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
