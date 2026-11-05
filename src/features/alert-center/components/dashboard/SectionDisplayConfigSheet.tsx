import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { DASHBOARD_INDICATORS } from '@/design-system/dashboard-indicators';
import { getAlertTypeIconConfigWithFallback } from '@/design-system/alert-type-icons';
import type { AlertType } from '@/types/alerts';
import type { SectionDisplayPreset } from '../../hooks/useSectionDisplayConfig';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import {
  getPoolAlertTypesForSection,
  isDoorOrTrunkAlert,
  type SectionDisplayConfig,
} from '../../constants/section-display-config';
import { cn } from '@/lib/utils';

interface SectionDisplayConfigSheetProps {
  sectionId: AlertCenterSectionId;
  sectionLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SectionDisplayConfig;
  setItemVisible: (alertType: AlertType, visible: boolean) => void;
  moveItem: (alertType: AlertType, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  applyPreset: (mode: SectionDisplayPreset) => void;
}

/** Webtrace alert-config-panel — blue header drawer (not shadcn Sheet). */
export function SectionDisplayConfigSheet({
  sectionId,
  sectionLabel,
  open,
  onOpenChange,
  config,
  setItemVisible,
  moveItem,
  resetToDefaults,
  applyPreset,
}: SectionDisplayConfigSheetProps) {
  const sortedItems = [...config.items].sort((a, b) => a.displayOrder - b.displayOrder);
  const visibleCount = sortedItems.filter((item) => item.visible).length;
  const totalCount = getPoolAlertTypesForSection(sectionId).length;
  const isDashboard = sectionId === 'dashboard';

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-config-title"
      >
        <header
          className="flex shrink-0 items-start justify-between gap-3 px-5 py-4 text-white"
          style={{ background: '#3b82f6' }}
        >
          <div className="min-w-0">
            <h2 id="alert-config-title" className="text-lg font-bold leading-tight">
              Configuration — {sectionLabel}
            </h2>
            <p className="mt-1 text-sm text-blue-100">
              {visibleCount} alerte(s) affichée(s) sur {totalCount}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-white/90 hover:bg-white/20"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex shrink-0 gap-2 border-b bg-white px-4 py-3" style={{ borderColor: '#E5E7EB' }}>
          <button
            type="button"
            onClick={() => applyPreset('critical')}
            className="flex-1 whitespace-nowrap rounded-[9px] border px-2.5 py-1.5 text-[11.5px] font-bold"
            style={{ borderColor: '#FECACA', background: '#FEF2F2', color: '#DC2626' }}
          >
            Critiques
          </button>
          <button
            type="button"
            onClick={() => applyPreset('all')}
            className="flex-1 whitespace-nowrap rounded-[9px] border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-slate-600"
          >
            Tout afficher
          </button>
          <button
            type="button"
            onClick={() => applyPreset('none')}
            className="flex-1 whitespace-nowrap rounded-[9px] border border-slate-200 bg-white px-2.5 py-1.5 text-[11.5px] font-bold text-slate-600"
          >
            Tout masquer
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {sortedItems.map((item, index) => {
            const entry = getTaxonomyEntry(item.alertType);
            const indicator = DASHBOARD_INDICATORS.find(
              (i) => i.alertTypeId === item.alertType
            );
            const iconConfig = getAlertTypeIconConfigWithFallback(
              item.alertType,
              entry.defaultSeverity
            );
            const Icon = indicator?.icon ?? iconConfig.icon;
            const isDoorTrunk = isDashboard && isDoorOrTrunkAlert(item.alertType);
            const tag = isDoorTrunk
              ? 'Porte/coffre'
              : isDashboard && entry.defaultSeverity !== 'critical'
                ? 'Non critique'
                : null;

            return (
              <div
                key={item.alertType}
                className={cn(
                  'flex items-center gap-3 rounded-lg border p-3',
                  item.visible
                    ? 'border-slate-200 bg-white'
                    : 'border-slate-100 bg-slate-50/80 opacity-75'
                )}
              >
                <div className="flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveItem(item.alertType, 'up')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Monter"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === sortedItems.length - 1}
                    onClick={() => moveItem(item.alertType, 'down')}
                    className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                    aria-label="Descendre"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ background: '#f1f5f9' }}
                >
                  <Icon className="h-4 w-4 text-slate-600" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {indicator?.label ?? entry.label}
                    </p>
                    {tag ? (
                      <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-500">
                        {tag}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">Ordre #{index + 1}</p>
                </div>

                <label className="flex shrink-0 cursor-pointer flex-col items-end gap-1">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={item.visible}
                    onClick={() => setItemVisible(item.alertType, !item.visible)}
                    className={cn(
                      'relative h-[22px] w-10 rounded-full transition-colors',
                      item.visible ? 'bg-emerald-500' : 'bg-slate-300'
                    )}
                  >
                    <span
                      className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-all"
                      style={{ left: item.visible ? 20 : 2 }}
                    />
                  </button>
                  <span className="text-[10px] text-slate-500">
                    {item.visible ? 'Affiché' : 'Masqué'}
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-4 py-3">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-[10px] py-2.5 text-[12.5px] font-bold text-white"
            style={{ background: '#2563EB' }}
          >
            Appliquer et fermer
          </button>
          <button
            type="button"
            onClick={resetToDefaults}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Réinitialiser aux valeurs par défaut
          </button>
        </footer>
      </aside>
    </div>
  );
}
