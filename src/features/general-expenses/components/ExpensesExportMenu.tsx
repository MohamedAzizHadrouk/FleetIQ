import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export function ExpensesExportMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        title="Exporter"
        className={cn(
          'inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium transition-colors lg:w-auto',
          open
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        )}
      >
        <Download className="h-3.5 w-3.5" />
        <span>Exporter</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              console.log('Export Excel');
              setOpen(false);
            }}
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-400" />
            Excel
          </button>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => {
              console.log('Export PDF');
              setOpen(false);
            }}
          >
            <FileText className="h-4 w-4 text-slate-400" />
            PDF
          </button>
        </div>
      )}
    </div>
  );
}
