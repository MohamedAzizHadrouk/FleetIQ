import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, CalendarRange, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

/**
 * One field for a period: start + end date with hours.
 * Values use the app format "YYYY/MM/DD HH:mm:ss" (same as DateTimePicker).
 */

interface DateTimeRangePickerProps {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  /** Compact trigger: a calendar icon button (period shown in its tooltip) */
  iconOnly?: boolean;
}

const pad = (n: number) => String(n).padStart(2, '0');

function parse(value: string): Date | null {
  const m = value?.match(/^(\d{4})\/(\d{2})\/(\d{2})(?: (\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] ?? 0), +(m[5] ?? 0), +(m[6] ?? 0));
}

function format(d: Date): string {
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function short(d: Date | null): string {
  return d ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}` : '—';
}

const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const dayOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const withTime = (day: Date, hhmm: string, seconds = 0) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), h || 0, m || 0, seconds);
};
const hhmm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

type Preset = { label: string; range: () => [Date, Date] };
const PRESETS: Preset[] = [
  {
    label: 'Aujourd’hui',
    range: () => {
      const now = new Date();
      return [dayOnly(now), now];
    },
  },
  {
    label: 'Hier',
    range: () => {
      const y = dayOnly(new Date(Date.now() - 86400000));
      return [y, new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59)];
    },
  },
  { label: '24 h', range: () => [new Date(Date.now() - 86400000), new Date()] },
  { label: '7 jours', range: () => [dayOnly(new Date(Date.now() - 6 * 86400000)), new Date()] },
  {
    label: 'Ce mois',
    range: () => {
      const now = new Date();
      return [new Date(now.getFullYear(), now.getMonth(), 1), now];
    },
  },
];

export function DateTimeRangePicker({
  start,
  end,
  onChange,
  label,
  placeholder = 'Période',
  className,
  iconOnly = false,
}: DateTimeRangePickerProps) {
  const startDate = parse(start);
  const endDate = parse(end);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });

  // Draft state while the popover is open
  const [dStart, setDStart] = useState<Date | null>(startDate);
  const [dEnd, setDEnd] = useState<Date | null>(endDate);
  const [startTime, setStartTime] = useState(startDate ? hhmm(startDate) : '00:00');
  const [endTime, setEndTime] = useState(endDate ? hhmm(endDate) : '23:59');
  const [picking, setPicking] = useState<'start' | 'end'>('start');
  const [month, setMonth] = useState(() => dayOnly(startDate ?? new Date()));
  const [hover, setHover] = useState<Date | null>(null);

  const openPicker = () => {
    const s = parse(start);
    const e = parse(end);
    setDStart(s ? dayOnly(s) : null);
    setDEnd(e ? dayOnly(e) : null);
    setStartTime(s ? hhmm(s) : '00:00');
    setEndTime(e ? hhmm(e) : '23:59');
    setPicking('start');
    setMonth(new Date((s ?? new Date()).getFullYear(), (s ?? new Date()).getMonth(), 1));
    setOpen(true);
  };

  // Position the popover under the trigger, kept inside the viewport
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = triggerRef.current?.getBoundingClientRect();
      if (!r) return;
      const w = popRef.current?.offsetWidth ?? 560;
      const h = popRef.current?.offsetHeight ?? 380;
      const left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
      const below = r.bottom + 6;
      const top = below + h > window.innerHeight - 8 ? Math.max(8, r.top - h - 6) : below;
      setPos({ left, top });
    };
    place();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!popRef.current?.contains(t) && !triggerRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // Monday first
    return Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - offset + i));
  }, [month]);

  const pickDay = (d: Date) => {
    if (picking === 'start' || !dStart) {
      setDStart(d);
      setDEnd(null);
      setPicking('end');
      return;
    }
    if (d < dStart) {
      setDEnd(dStart);
      setDStart(d);
    } else {
      setDEnd(d);
    }
    setPicking('start');
  };

  const rangeEnd = dEnd ?? (picking === 'end' ? hover : null);
  const inRange = (d: Date) => dStart && rangeEnd && d > dStart && d < rangeEnd;

  const finalStart = dStart ? withTime(dStart, startTime) : null;
  const finalEnd = dEnd ? withTime(dEnd, endTime, 59) : null;
  const invalid = !!finalStart && !!finalEnd && finalEnd <= finalStart;
  const canApply = !!finalStart && !!finalEnd && !invalid;

  const apply = () => {
    if (!finalStart || !finalEnd || invalid) return;
    onChange(format(finalStart), format(finalEnd));
    setOpen(false);
  };

  const applyPreset = (p: Preset) => {
    const [s, e] = p.range();
    onChange(format(s), format(e));
    setOpen(false);
  };

  const hasValue = !!startDate && !!endDate;

  return (
    <div className={className}>
      {label && <label className="text-xs font-semibold text-slate-500 mb-1.5 block">{label}</label>}
      {iconOnly ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={hasValue ? `Période : ${short(startDate)} → ${short(endDate)}` : placeholder}
          title={hasValue ? `Période : ${short(startDate)} → ${short(endDate)}` : placeholder}
          className={`relative w-9 h-9 shrink-0 inline-flex items-center justify-center rounded-xl border transition-all ${
            open
              ? 'border-[#2F6BFF] bg-[#EAF1FF] text-[#2F6BFF] ring-2 ring-[#2F6BFF]/15'
              : 'border-[#DCE3EF] bg-white text-[#2F6BFF] hover:border-[#BFD3FF] hover:bg-[#F7F9FF]'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          {hasValue && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#2F6BFF] ring-2 ring-white" />}
        </button>
      ) : (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={hasValue ? `${start} → ${end}` : placeholder}
        className={`w-full h-8 flex items-center gap-1.5 bg-white border rounded-lg px-2.5 text-xs shadow-sm transition-all ${
          open ? 'border-[#2F6BFF] ring-2 ring-[#2F6BFF]/15' : 'border-slate-200 hover:border-blue-400'
        }`}
      >
        <CalendarRange className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        {hasValue ? (
          <span className="flex items-center gap-1 min-w-0 text-slate-700 font-medium tabular-nums truncate">
            <span className="truncate">{short(startDate)}</span>
            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{short(endDate)}</span>
          </span>
        ) : (
          <span className="text-slate-400 truncate">{placeholder}</span>
        )}
      </button>
      )}

      {open &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Choisir une période"
            className="fiq-popover fiq-font fixed z-[10000] flex bg-white text-[#0F1B3D] rounded-2xl border border-[#E3E9F4] shadow-[0_18px_40px_rgba(15,27,61,0.18)] overflow-hidden"
            style={{ left: pos.left, top: pos.top }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Presets */}
            <div className="w-[118px] shrink-0 border-r border-[#E3E9F4] bg-[#F7F9FF] p-2 flex flex-col gap-0.5">
              <p className="px-2 pt-1 pb-1.5 text-[11px] font-extrabold text-[#5B6B8C] uppercase tracking-[0.04em]">Raccourcis</p>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="text-left px-2 py-1.5 rounded-lg text-[12.5px] font-semibold hover:bg-white hover:text-[#2F6BFF]"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="p-3 w-[296px]">
              {/* Month header */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  aria-label="Mois précédent"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                  className="w-7 h-7 rounded-lg hover:bg-[#F0F3F9] flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[13px] font-extrabold">
                  {MONTHS[month.getMonth()]} {month.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Mois suivant"
                  onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                  className="w-7 h-7 rounded-lg hover:bg-[#F0F3F9] flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Calendar */}
              <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#8A94A6] mb-1">
                {WEEKDAYS.map((w, i) => (
                  <span key={i}>{w}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5" onMouseLeave={() => setHover(null)}>
                {days.map((d) => {
                  const outside = d.getMonth() !== month.getMonth();
                  const isStart = !!dStart && sameDay(d, dStart);
                  const isEnd = !!rangeEnd && sameDay(d, rangeEnd);
                  const between = inRange(d);
                  const today = sameDay(d, new Date());
                  return (
                    <div
                      key={d.toISOString()}
                      className={`flex justify-center ${between ? 'bg-[#EAF1FF]' : ''} ${
                        isStart && rangeEnd && !isEnd ? 'bg-gradient-to-r from-transparent from-50% to-[#EAF1FF] to-50%' : ''
                      } ${isEnd && dStart && !isStart ? 'bg-gradient-to-l from-transparent from-50% to-[#EAF1FF] to-50%' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => pickDay(d)}
                        onMouseEnter={() => setHover(d)}
                        aria-pressed={isStart || isEnd}
                        className={`w-9 h-8 rounded-lg text-[12.5px] tabular-nums transition-colors ${
                          isStart || isEnd
                            ? 'bg-[#2F6BFF] text-white font-extrabold'
                            : outside
                              ? 'text-[#B8C3DA] hover:bg-[#F0F3F9]'
                              : `font-semibold hover:bg-[#F0F3F9] ${today ? 'text-[#2F6BFF] underline underline-offset-2' : ''}`
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {[
                  { k: 'start', label: 'Début', day: dStart, time: startTime, set: setStartTime },
                  { k: 'end', label: 'Fin', day: dEnd, time: endTime, set: setEndTime },
                ].map((f) => (
                  <label
                    key={f.k}
                    className={`rounded-xl border px-2.5 py-1.5 ${
                      picking === f.k && !(f.k === 'start' && dStart && !dEnd) ? 'border-[#2F6BFF]' : 'border-[#E3E9F4]'
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-[#5B6B8C]">
                      {f.label} · {f.day ? `${pad(f.day.getDate())}/${pad(f.day.getMonth() + 1)}/${f.day.getFullYear()}` : 'choisir un jour'}
                    </span>
                    <span className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#2F6BFF]" />
                      <input
                        type="time"
                        value={f.time}
                        onChange={(e) => f.set(e.target.value || '00:00')}
                        className="flex-1 min-w-0 text-[13px] font-bold tabular-nums bg-transparent outline-none"
                        aria-label={`Heure de ${f.label.toLowerCase()}`}
                      />
                    </span>
                  </label>
                ))}
              </div>

              <p className={`mt-2 text-[11.5px] ${invalid ? 'text-[#E5484D] font-semibold' : 'text-[#8A94A6]'}`}>
                {invalid
                  ? 'La fin doit être après le début.'
                  : picking === 'end' && !dEnd
                    ? 'Cliquez sur le jour de fin.'
                    : 'Cliquez sur le jour de début puis sur le jour de fin.'}
              </p>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="h-8 px-3 rounded-lg border border-[#DCE3EF] text-[12.5px] font-bold hover:bg-[#F7F9FF]"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={apply}
                  disabled={!canApply}
                  className="h-8 px-3.5 rounded-lg bg-[#2F6BFF] text-white text-[12.5px] font-bold hover:bg-[#2459E0] disabled:opacity-40"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
