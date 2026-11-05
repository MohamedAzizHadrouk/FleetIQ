import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AlertDayPickerButtonProps {
  value?: string;
  onChange: (date?: string) => void;
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

export function AlertDayPickerButton({ value, onChange }: AlertDayPickerButtonProps) {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => parseIsoDate(value) ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const parsed = parseIsoDate(value);
      if (parsed) setCurrentMonth(parsed);
    }
  }, [value]);

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

  const selectedDate = parseIsoDate(value);
  const today = new Date();

  const handleSelect = (date: Date) => {
    onChange(toIsoDate(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        title={value ? `Jour sélectionné : ${formatDisplayDate(value)}` : 'Filtrer par jour'}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'h-9 w-9 border border-slate-600 hover:bg-slate-800 hover:text-white',
          value ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'text-slate-400'
        )}
      >
        <Calendar className="h-4 w-4" />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-lg border border-slate-600 bg-slate-800 shadow-xl p-3">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
              }
              className="p-1 rounded hover:bg-slate-700 text-slate-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-slate-200 capitalize">
              {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() =>
                setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
              }
              className="p-1 rounded hover:bg-slate-700 text-slate-300"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map((day) => (
              <span key={day} className="text-[10px] text-center text-slate-500 font-medium">
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
                    selectedDate && isSameDay(date, selectedDate)
                      ? 'bg-blue-600 text-white'
                      : isSameDay(date, today)
                        ? 'bg-slate-700 text-slate-100'
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

          {value && (
            <button
              type="button"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <X className="h-3 w-3" /> Effacer le filtre
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function formatSelectedDateLabel(iso: string): string {
  return `Alertes du ${formatDisplayDate(iso)}`;
}
