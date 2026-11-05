import { useMemo, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Vehicle } from '@/types';
import type { AlertHistoryFilters } from '@/features/alert-center/api/alert-api';
import { initAlertStore } from '@/features/alert-center/api/alert-api';
import { useAlertHistory } from '@/features/alert-center/hooks/useAlertQueries';
import { AlertHistoryFiltersBar } from '@/features/alert-center/components/history/AlertHistoryFiltersBar';
import { AlertHistoryTable } from '@/features/alert-center/components/history/AlertHistoryTable';
import {
  exportAlertHistoryCsv,
  exportAlertHistoryPdf,
} from '@/features/alert-center/lib/alert-history-export';
import { TableFooter } from '@/components/TableFooter';

interface AlertHistoryPageProps {
  vehicles?: Vehicle[];
  initialVehicleIds?: string[];
  onBack?: () => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
}

/** Webtrace alert-history chrome. */
export function AlertHistoryPage({
  vehicles = [],
  initialVehicleIds = [],
  onBack,
  onNavigateToVehicle,
}: AlertHistoryPageProps) {
  useEffect(() => {
    if (vehicles.length) initAlertStore(vehicles);
  }, [vehicles]);

  const [filters, setFilters] = useState<AlertHistoryFilters>({
    vehicleIds: initialVehicleIds.length ? initialVehicleIds : undefined,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const queryFilters = useMemo(
    () => ({
      ...filters,
      categories: filters.categories?.length ? filters.categories : undefined,
      alertTypes: filters.alertTypes?.length ? filters.alertTypes : undefined,
      vehicleIds: filters.vehicleIds?.length ? filters.vehicleIds : undefined,
    }),
    [filters]
  );

  const { data: rows = [], isLoading } = useAlertHistory(queryFilters);

  useEffect(() => {
    setCurrentPage(1);
  }, [queryFilters]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage, itemsPerPage]);

  const handleFilterChange = (patch: Partial<AlertHistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      <div className="w-full flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-slate-800"
            style={{ color: '#64748b' }}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
        ) : null}

        <div>
          <h1
            className="font-bold leading-tight"
            style={{ fontSize: '1.75rem', color: '#0f2744' }}
          >
            Historique d&apos;alerte
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
            Consultez et filtrez l&apos;historique des alertes de la flotte
          </p>
        </div>

        <AlertHistoryFiltersBar filters={filters} onChange={handleFilterChange} />

        <p className="text-sm text-slate-500">
          {isLoading ? 'Chargement...' : `${rows.length} alerte(s) trouvée(s)`}
          {initialVehicleIds.length > 0 && filters.vehicleIds?.length
            ? ' — filtré par véhicule sélectionné'
            : ''}
        </p>

        <AlertHistoryTable
          rows={paginatedRows}
          isLoading={isLoading}
          onVehicleClick={(vehicleId) => {
            const v = vehicles.find((x) => x.id === vehicleId);
            if (v?.coordinates) {
              onNavigateToVehicle?.(vehicleId, v.coordinates);
            }
          }}
          footer={
            !isLoading ? (
              <TableFooter
                currentPage={currentPage}
                totalItems={rows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                onExportPdf={() => exportAlertHistoryPdf(rows)}
                onExportExcel={() => exportAlertHistoryCsv(rows)}
              />
            ) : undefined
          }
        />
      </div>
    </div>
  );
}
