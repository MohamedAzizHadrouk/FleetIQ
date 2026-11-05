import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface VehicleSearchMultiSelectProps {
  vehicles: Vehicle[];
  value: string[];
  onChange: (ids: string[]) => void;
  variant?: 'dark' | 'light';
}

const VARIANT_STYLES = {
  dark: {
    input: 'pl-8 bg-slate-800 border-slate-600 text-slate-200 placeholder:text-slate-500 h-9',
    searchIcon: 'text-slate-500',
    badge: 'border-slate-600 text-slate-300 bg-slate-800',
    dropdown: 'border-slate-600 bg-slate-800',
    dropdownHeader: 'border-slate-700',
    dropdownMeta: 'text-slate-400',
    link: 'text-blue-400 hover:text-blue-300',
    clear: 'text-slate-400 hover:text-slate-300',
    empty: 'text-slate-500',
    itemSelected: 'bg-blue-900/40 border-blue-700/50',
    itemHover: 'hover:bg-slate-700/50',
    itemTitle: 'text-slate-200',
    itemSubtitle: 'text-slate-500',
    checkbox: 'border-slate-500 data-[state=checked]:bg-blue-600',
  },
  light: {
    input: 'pl-8 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-8 text-xs',
    searchIcon: 'text-slate-400',
    badge: 'border-slate-200 text-slate-700 bg-slate-50',
    dropdown: 'border-slate-200 bg-white',
    dropdownHeader: 'border-slate-100',
    dropdownMeta: 'text-slate-500',
    link: 'text-blue-600 hover:text-blue-700',
    clear: 'text-slate-500 hover:text-slate-700',
    empty: 'text-slate-400',
    itemSelected: 'bg-blue-50 border-blue-200',
    itemHover: 'hover:bg-slate-50',
    itemTitle: 'text-slate-800',
    itemSubtitle: 'text-slate-500',
    checkbox: 'border-slate-300 data-[state=checked]:bg-blue-600',
  },
} as const;

export function VehicleSearchMultiSelect({
  vehicles,
  value,
  onChange,
  variant = 'dark',
}: VehicleSearchMultiSelectProps) {
  const styles = VARIANT_STYLES[variant];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const labelById = useMemo(() => new Map(vehicles.map((v) => [v.id, v.name])), [vehicles]);

  const filteredVehicles = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q)
    );
  }, [vehicles, query]);

  const isSelected = (id: string) => value.includes(id);

  const toggle = (id: string) => {
    onChange(isSelected(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selectAllVisible = () => {
    const visibleIds = filteredVehicles.map((v) => v.id);
    onChange(Array.from(new Set([...value, ...visibleIds])));
  };

  const clearAll = () => onChange([]);

  const removeOne = (id: string) => onChange(value.filter((v) => v !== id));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="relative">
        <Search className={cn('absolute left-2.5 top-2.5 h-3.5 w-3.5 pointer-events-none', styles.searchIcon)} />
        <Input
          placeholder="Véhicule, immatriculation, conducteur..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          className={cn('pl-8', styles.input)}
        />
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1.5">
          {value.map((id) => (
            <Badge
              key={id}
              variant="outline"
              className={cn('text-[10px] h-5 gap-1', styles.badge)}
            >
              {labelById.get(id) ?? id}
              <button
                type="button"
                onClick={() => removeOne(id)}
                className="hover:text-white"
                aria-label={`Retirer ${labelById.get(id) ?? id}`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {open && (
        <div className={cn('absolute left-0 right-0 top-full z-50 mt-1 rounded-md border shadow-lg', styles.dropdown)}>
          <div className={cn('flex items-center justify-between gap-2 px-2 py-1.5 border-b', styles.dropdownHeader)}>
            <span className={cn('text-[10px]', styles.dropdownMeta)}>
              {value.length > 0
                ? `${value.length} sélectionné${value.length > 1 ? 's' : ''}`
                : `${filteredVehicles.length} véhicule${filteredVehicles.length > 1 ? 's' : ''}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAllVisible}
                className={cn('text-[10px] hover:underline', styles.link)}
              >
                Tout sélectionner
              </button>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className={cn('text-[10px] hover:underline', styles.clear)}
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto p-1">
            {filteredVehicles.length === 0 ? (
              <p className={cn('text-xs text-center py-4', styles.empty)}>Aucun véhicule trouvé</p>
            ) : (
              filteredVehicles.map((vehicle) => (
                <label
                  key={vehicle.id}
                  className={cn(
                    'flex items-start gap-2 p-2 rounded-md cursor-pointer transition-colors',
                    isSelected(vehicle.id)
                      ? cn(styles.itemSelected, 'border')
                      : cn(styles.itemHover, 'border border-transparent')
                  )}
                >
                  <Checkbox
                    checked={isSelected(vehicle.id)}
                    onCheckedChange={() => toggle(vehicle.id)}
                    className={cn('mt-0.5', styles.checkbox)}
                  />
                  <div className="min-w-0">
                    <p className={cn('text-sm truncate', styles.itemTitle)}>{vehicle.name}</p>
                    <p className={cn('text-[11px] truncate', styles.itemSubtitle)}>{vehicle.driver}</p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
