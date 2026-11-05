import { useState } from 'react';
import { ChevronDown, Settings } from 'lucide-react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSection, AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getAlertTypesForCenterSection } from '../../constants/alert-config-sections';
import { useAlertTypeVehicleCounts } from '../../hooks/useAlertQueries';
import { useSectionDisplayConfig } from '../../hooks/useSectionDisplayConfig';
import { AlertTypeIndicatorTile } from './AlertTypeIndicatorTile';
import { SectionDisplayConfigSheet } from './SectionDisplayConfigSheet';
import { cn } from '@/lib/utils';

interface AlertSectionPanelProps {
  section: AlertCenterSection;
  defaultOpen?: boolean;
  biOn?: boolean;
  onSelectAlertType: (alertType: AlertType, sectionId: AlertCenterSectionId) => void;
}

/** Webtrace `.alert-section` accordion with horizontal type cards grid. */
export function AlertSectionPanel({
  section,
  defaultOpen = true,
  biOn = false,
  onSelectAlertType,
}: AlertSectionPanelProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [configOpen, setConfigOpen] = useState(false);
  const { visibleAlertTypes, config, setItemVisible, moveItem, resetToDefaults, applyPreset } =
    useSectionDisplayConfig(section.id);

  const poolAlertTypes = getAlertTypesForCenterSection(section.id);
  const { data: counts = {} } = useAlertTypeVehicleCounts(poolAlertTypes);

  // Webtrace shows all visible types (including count 0)
  const displayAlertTypes = visibleAlertTypes;
  const vehiclesWithAlerts = displayAlertTypes.reduce(
    (sum, type) => sum + ((counts[type] ?? 0) > 0 ? 1 : 0),
    0
  );

  return (
    <>
      <section
        className="w-full overflow-hidden rounded-[0.9rem] border bg-white shadow-sm"
        style={{ borderColor: '#e8edf3' }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
        >
          <div className="min-w-0 text-left">
            <h2 className="text-base font-semibold text-slate-800">{section.label}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {visibleAlertTypes.length === 0
                ? 'Aucune alerte configurée'
                : `${vehiclesWithAlerts} véhicule(s) avec alerte(s) active(s)`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Configuration"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                setConfigOpen(true);
              }}
              aria-label={`Configuration — ${section.label}`}
            >
              <Settings className="h-5 w-5" />
            </button>
            <ChevronDown
              className={cn(
                'h-5 w-5 text-slate-400 transition-transform',
                open && 'rotate-180'
              )}
              aria-hidden
            />
          </div>
        </button>

        {open ? (
          <div className="px-5 pb-[1.15rem]">
            {displayAlertTypes.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">
                Aucune alerte à afficher.
              </p>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(15.5rem, 1fr))',
                }}
              >
                {displayAlertTypes.map((alertType) => (
                  <AlertTypeIndicatorTile
                    key={alertType}
                    alertType={alertType}
                    vehicleCount={counts[alertType] ?? 0}
                    showBiTag={biOn}
                    onClick={() => onSelectAlertType(alertType, section.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>

      <SectionDisplayConfigSheet
        sectionId={section.id}
        sectionLabel={section.label}
        open={configOpen}
        onOpenChange={setConfigOpen}
        config={config}
        setItemVisible={setItemVisible}
        moveItem={moveItem}
        resetToDefaults={resetToDefaults}
        applyPreset={applyPreset}
      />
    </>
  );
}
