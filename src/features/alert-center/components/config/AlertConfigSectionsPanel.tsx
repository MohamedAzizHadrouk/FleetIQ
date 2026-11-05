import { useMemo, useState } from 'react';
import type { Vehicle } from '@/types';
import type { AlertScopeRef } from '@/types/alert-config';
import type { AlertType } from '@/types/alerts';
import { ALERT_CONFIG_SECTIONS, getAlertTypesForSection } from '../../constants/alert-config-sections';
import { resolveConfigsForSection } from '../../lib/alert-config-resolver';
import { useScopeConfigs } from '../../hooks/useAlertQueries';
import { DashboardAlertsSection } from './DashboardAlertsSection';
import { FleetManagementAlertsSection } from './FleetManagementAlertsSection';
import { GeofencingAlertsSection } from './GeofencingAlertsSection';
import { SecurityAlertsSection } from './SecurityAlertsSection';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface AlertConfigSectionsPanelProps {
  selectedScopes: AlertScopeRef[];
  vehicles: Vehicle[];
}

export function AlertConfigSectionsPanel({ selectedScopes, vehicles }: AlertConfigSectionsPanelProps) {
  const { data: configs = [] } = useScopeConfigs();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(['dashboard', 'vehicle_management'])
  );

  const dashboardResolved = useMemo(
    () =>
      resolveConfigsForSection(
        selectedScopes,
        configs,
        getAlertTypesForSection('dashboard') as AlertType[]
      ),
    [selectedScopes, configs]
  );

  const fleetResolved = useMemo(
    () =>
      resolveConfigsForSection(
        selectedScopes,
        configs,
        getAlertTypesForSection('vehicle_management') as AlertType[]
      ),
    [selectedScopes, configs]
  );

  const securityResolved = useMemo(
    () =>
      resolveConfigsForSection(
        selectedScopes,
        configs,
        getAlertTypesForSection('security') as AlertType[]
      ),
    [selectedScopes, configs]
  );

  const geolocationResolved = useMemo(
    () =>
      resolveConfigsForSection(
        selectedScopes,
        configs,
        getAlertTypesForSection('geolocation') as AlertType[]
      ),
    [selectedScopes, configs]
  );

  const toggleSection = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-slate-200 dark:border-slate-700 px-4 pt-3">
        <p className="pb-2 text-sm font-medium text-blue-600 border-b-2 border-blue-500">
          Configuration des alertes
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {ALERT_CONFIG_SECTIONS.map((section) => {
            const isOpen = openSections.has(section.id);
            return (
              <div
                key={section.id}
                className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div>
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {section.label}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-slate-400 transition-transform',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800">
                    {section.id === 'dashboard' && (
                      <DashboardAlertsSection
                        selectedScopes={selectedScopes}
                        resolved={dashboardResolved}
                      />
                    )}
                    {section.id === 'vehicle_management' && (
                      <FleetManagementAlertsSection
                        selectedScopes={selectedScopes}
                        resolved={fleetResolved}
                      />
                    )}
                    {section.id === 'geolocation' && (
                      <GeofencingAlertsSection
                        selectedScopes={selectedScopes}
                        resolved={geolocationResolved}
                        vehicles={vehicles}
                      />
                    )}
                    {section.id === 'security' && (
                      <SecurityAlertsSection
                        selectedScopes={selectedScopes}
                        resolved={securityResolved}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
