import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Vehicle } from '@/types';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import { useOrgStructure } from '../../hooks/useAlertQueries';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ScopeTargetMultiSelectProps {
  scopeType: 'vehicle' | 'department';
  value: string[];
  onChange: (ids: string[]) => void;
  vehicles: Vehicle[];
  error?: string;
}

export function ScopeTargetMultiSelect({
  scopeType,
  value,
  onChange,
  vehicles,
  error,
}: ScopeTargetMultiSelectProps) {
  const [search, setSearch] = useState('');
  const { data: org, isLoading } = useOrgStructure();

  const allItems = useMemo(() => {
    if (scopeType === 'vehicle') {
      return vehicles.map((v) => ({ id: v.id, label: v.name }));
    }
    return (org?.departments ?? []).map((d) => ({ id: d.id, label: d.name }));
  }, [scopeType, org, vehicles]);

  const labelById = useMemo(() => new Map(allItems.map((item) => [item.id, item.label])), [allItems]);

  const items = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
    );
  }, [allItems, search]);

  const isSelected = (id: string) => value.includes(id);

  const toggle = (id: string) => {
    onChange(isSelected(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const selectAll = () => {
    const visibleIds = items.map((item) => item.id);
    const merged = new Set([...value, ...visibleIds]);
    onChange(Array.from(merged));
  };

  const clearAll = () => onChange([]);

  const scopeLabel = ALERT_SCOPE_TYPE_LABELS[scopeType];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{scopeLabel}s</Label>
        {value.length > 0 && (
          <Badge variant="info" className="text-[10px] h-5">
            {value.length} sélectionné{value.length > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((id) => (
            <Badge key={id} variant="outline" className="text-[10px] font-normal">
              {labelById.get(id) ?? id}
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Rechercher ${scopeLabel.toLowerCase()}...`}
          className="pl-8 h-9 text-sm"
        />
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={selectAll} className="text-[10px] text-blue-600 hover:underline">
          Tout sélectionner
        </button>
        <button type="button" onClick={clearAll} className="text-[10px] text-slate-500 hover:underline">
          Effacer
        </button>
      </div>

      <div
        className={cn(
          'max-h-40 overflow-y-auto rounded-md border p-1 space-y-0.5',
          error ? 'border-rose-300' : 'border-slate-200'
        )}
      >
        {isLoading && scopeType === 'department' ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">Aucun élément trouvé</p>
        ) : (
          items.map((item) => (
            <label
              key={item.id}
              className={cn(
                'flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors',
                isSelected(item.id) ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50 border border-transparent'
              )}
            >
              <Checkbox checked={isSelected(item.id)} onCheckedChange={() => toggle(item.id)} />
              <span className="text-sm text-slate-800 truncate">{item.label}</span>
            </label>
          ))
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
