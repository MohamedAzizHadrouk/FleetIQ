import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface MultiSelectItem {
  id: string;
  label: string;
}

interface MultiSelectDropdownProps {
  items: MultiSelectItem[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
  searchPlaceholder?: string;
  allSelectedLabel?: string;
  emptyMessage?: string;
}

export function MultiSelectDropdown({
  items,
  selectedIds,
  onChange,
  label,
  searchPlaceholder = 'Rechercher...',
  allSelectedLabel = 'Tous',
  emptyMessage = 'Aucun élément',
}: MultiSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, search]);

  const buttonLabel =
    selectedIds.length === 0
      ? allSelectedLabel
      : selectedIds.length === 1
        ? items.find((i) => i.id === selectedIds[0])?.label ?? label
        : `${selectedIds.length} sélectionné(s)`;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else onChange([...selectedIds, id]);
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="min-w-[180px] justify-between"
      >
        <span className="truncate">
          {label}: {buttonLabel}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0', open && 'rotate-180')} />
      </Button>
      {open ? (
        <div className="absolute left-0 z-20 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-2 dark:border-slate-800">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-8"
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-sm text-slate-500">{emptyMessage}</p>
            ) : (
              filtered.map((item) => {
                const checked = selectedIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        checked
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-slate-300'
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" /> : null}
                    </span>
                    {item.label}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex justify-between border-t border-slate-100 p-2 dark:border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange([])}
            >
              Tout désélectionner
            </Button>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.map((i) => i.id))}
              >
                Tout sélectionner
              </Button>
              <Button type="button" size="sm" onClick={() => setOpen(false)}>
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
