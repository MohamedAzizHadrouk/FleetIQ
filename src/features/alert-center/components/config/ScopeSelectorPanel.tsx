import { useEffect, useMemo, useState } from 'react';
import { Search, Building2, Car } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertScopeRef, AlertScopeType } from '@/types/alert-config';
import { ALERT_SCOPE_TYPE_LABELS } from '@/types/alert-config';
import { useOrgStructure } from '../../hooks/useAlertQueries';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ScopeSelectorPanelProps {
  vehicles: Vehicle[];
  selectedScopes: AlertScopeRef[];
  onSelectionChange: (scopes: AlertScopeRef[]) => void;
}

const SCOPE_TABS: { id: Extract<AlertScopeType, 'vehicle' | 'department'>; icon: typeof Car }[] = [
  { id: 'vehicle', icon: Car },
  { id: 'department', icon: Building2 },
];

export function ScopeSelectorPanel({
  vehicles,
  selectedScopes,
  onSelectionChange,
}: ScopeSelectorPanelProps) {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'department'>('vehicle');
  const [search, setSearch] = useState('');
  const { data: org, isLoading } = useOrgStructure();

  useEffect(() => {
    const withoutGroups = selectedScopes.filter((s) => s.scopeType !== 'group');
    if (withoutGroups.length !== selectedScopes.length) {
      onSelectionChange(withoutGroups);
    }
  }, [selectedScopes, onSelectionChange]);

  const items = useMemo(() => {
    const q = search.toLowerCase();
    if (activeTab === 'vehicle') {
      return vehicles
        .filter((v) => v.name.toLowerCase().includes(q) || v.id.includes(q))
        .map((v) => ({ id: v.id, label: v.name }));
    }
    return (org?.departments ?? [])
      .filter((d) => d.name.toLowerCase().includes(q))
      .map((d) => ({ id: d.id, label: d.name }));
  }, [activeTab, org, search, vehicles]);

  const isSelected = (scopeId: string) =>
    selectedScopes.some((s) => s.scopeType === activeTab && s.scopeId === scopeId);

  const toggle = (scopeId: string) => {
    const exists = isSelected(scopeId);
    if (exists) {
      onSelectionChange(
        selectedScopes.filter((s) => !(s.scopeType === activeTab && s.scopeId === scopeId))
      );
    } else {
      onSelectionChange([...selectedScopes, { scopeType: activeTab, scopeId }]);
    }
  };

  const selectAll = () => {
    const others = selectedScopes.filter((s) => s.scopeType !== activeTab);
    onSelectionChange([
      ...others,
      ...items.map((item) => ({ scopeType: activeTab, scopeId: item.id })),
    ]);
  };

  const clearTab = () => {
    onSelectionChange(selectedScopes.filter((s) => s.scopeType !== activeTab));
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-3">
          Périmètre de configuration
        </h2>
        <div className="flex gap-1 mb-3">
          {SCOPE_TABS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-[10px] font-medium transition-colors',
                activeTab === id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-slate-500 hover:bg-slate-50 border border-transparent'
              )}
            >
              <Icon className="w-4 h-4" />
              {ALERT_SCOPE_TYPE_LABELS[id].split(' ')[0]}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Rechercher ${ALERT_SCOPE_TYPE_LABELS[activeTab].toLowerCase()}...`}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={selectAll} className="text-[10px] text-blue-600 hover:underline">
            Tout sélectionner
          </button>
          <button type="button" onClick={clearTab} className="text-[10px] text-slate-500 hover:underline">
            Effacer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading && activeTab !== 'vehicle' ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">Aucun élément trouvé</p>
        ) : (
          items.map((item) => (
            <label
              key={item.id}
              className={cn(
                'flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors',
                isSelected(item.id) ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50 border border-transparent'
              )}
            >
              <Checkbox checked={isSelected(item.id)} onCheckedChange={() => toggle(item.id)} />
              <span className="text-sm text-slate-800 dark:text-slate-200 truncate">{item.label}</span>
            </label>
          ))
        )}
      </div>

      {selectedScopes.length > 0 && (
        <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1">
            Sélection ({selectedScopes.length})
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            Les alertes actives sur tous les éléments sélectionnés apparaissent comme actives.
          </p>
        </div>
      )}
    </div>
  );
}
