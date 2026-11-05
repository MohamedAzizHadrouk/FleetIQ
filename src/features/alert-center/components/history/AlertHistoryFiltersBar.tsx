import { useMemo } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import type { AlertCategory, AlertType } from '@/types/alerts';
import { ALERT_CATEGORIES } from '@/design-system/alert-categories';
import { ALERT_TAXONOMY } from '../../constants/alert-taxonomy';
import type { AlertHistoryFilters } from '../../api/alert-api';
import { AlertPeriodPickerButton } from '../filters/AlertPeriodPickerButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ALL_TYPE_OPTIONS = Object.values(ALERT_TAXONOMY).filter(
  (entry) => entry.id !== 'all' && entry.id !== 'unknown'
);

interface AlertHistoryFiltersBarProps {
  filters: AlertHistoryFilters;
  onChange: (patch: Partial<AlertHistoryFilters>) => void;
}

function toggleItem<T extends string>(items: T[], item: T): T[] {
  return items.includes(item) ? items.filter((i) => i !== item) : [...items, item];
}

/** Webtrace history toolbar: search + calendar icon + compact multi-selects. */
export function AlertHistoryFiltersBar({ filters, onChange }: AlertHistoryFiltersBarProps) {
  const typeOptions = useMemo(() => {
    if (!filters.categories?.length) return ALL_TYPE_OPTIONS;
    return ALL_TYPE_OPTIONS.filter((entry) => filters.categories!.includes(entry.category));
  }, [filters.categories]);

  const categoryLabel =
    filters.categories?.length === 0 || !filters.categories
      ? 'Catégories'
      : `${filters.categories.length} catégorie(s)`;

  const typeLabel =
    filters.alertTypes?.length === 0 || !filters.alertTypes
      ? "Types d'alerte"
      : `${filters.alertTypes.length} type(s)`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative min-w-[200px] max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder="Rechercher véhicule, chauffeur, lieu..."
          className="h-9 rounded-lg border-slate-200 bg-white pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <AlertPeriodPickerButton
          variant="light"
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onChange={({ dateFrom, dateTo }) => onChange({ dateFrom, dateTo })}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 border-slate-200 bg-white text-slate-600"
            >
              {categoryLabel}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-64 w-64 overflow-y-auto p-2">
            {ALERT_CATEGORIES.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50"
              >
                <Checkbox
                  checked={filters.categories?.includes(cat.id) ?? false}
                  onCheckedChange={() =>
                    onChange({
                      categories: toggleItem(
                        filters.categories ?? [],
                        cat.id as AlertCategory
                      ),
                    })
                  }
                />
                <span className="text-sm">{cat.label}</span>
              </label>
            ))}
            {(filters.categories?.length ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-7 w-full text-xs"
                onClick={() => onChange({ categories: [] })}
              >
                Tout effacer
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1 border-slate-200 bg-white text-slate-600"
            >
              {typeLabel}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-72 w-72 overflow-y-auto p-2">
            {typeOptions.map((entry) => (
              <label
                key={entry.id}
                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-slate-50"
              >
                <Checkbox
                  checked={filters.alertTypes?.includes(entry.id as AlertType) ?? false}
                  onCheckedChange={() =>
                    onChange({
                      alertTypes: toggleItem(
                        filters.alertTypes ?? [],
                        entry.id as AlertType
                      ),
                    })
                  }
                />
                <span className="truncate text-sm">{entry.label}</span>
              </label>
            ))}
            {(filters.alertTypes?.length ?? 0) > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-1 h-7 w-full text-xs"
                onClick={() => onChange({ alertTypes: [] })}
              >
                Tout effacer
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
