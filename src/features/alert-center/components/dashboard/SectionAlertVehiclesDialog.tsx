import { useEffect, useMemo, useState } from 'react';
import type { AlertType } from '@/types/alerts';
import type { AlertCenterSectionId } from '../../constants/alert-config-sections';
import { getTaxonomyEntry } from '../../constants/alert-taxonomy';
import {
  getCellValue,
  getColumnsForSection,
  type SectionAlertVehicleRow,
} from '../../constants/alert-section-vehicle-rows';
import { useVehiclesForAlertType } from '../../hooks/useAlertQueries';
import { TableFooter } from '@/components/TableFooter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface SectionAlertVehiclesDialogProps {
  alertType: AlertType | null;
  sectionId: AlertCenterSectionId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onSelectVehicle?: (vehicleId: string) => void;
}

/** Webtrace alert-details-modal — blue header + datagrid. */
export function SectionAlertVehiclesDialog({
  alertType,
  sectionId,
  open,
  onOpenChange,
  onNavigateToVehicle,
  onSelectVehicle,
}: SectionAlertVehiclesDialogProps) {
  const { data: rows = [], isLoading } = useVehiclesForAlertType(
    open ? alertType : null,
    open ? sectionId : null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const label = alertType ? getTaxonomyEntry(alertType).label : '';
  const columns = sectionId ? getColumnsForSection(sectionId) : [];

  useEffect(() => {
    setCurrentPage(1);
  }, [alertType, sectionId, open]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return rows.slice(start, start + itemsPerPage);
  }, [rows, currentPage, itemsPerPage]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden p-0">
        <DialogHeader className="bg-blue-500 px-6 py-4 pr-14 text-left">
          <DialogTitle className="text-xl font-bold text-white">{label}</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
          {isLoading ? (
            <div className="space-y-2 px-6 py-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              Aucun véhicule avec cette alerte
            </p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-white text-left">
                    {columns.map((col) => (
                      <th
                        key={col.id}
                        className={cn(
                          'px-5 py-3 text-[0.68rem] font-semibold uppercase tracking-wider text-slate-500',
                          col.id === 'action' && 'text-right'
                        )}
                      >
                        {col.id === 'action' ? '' : col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row: SectionAlertVehicleRow, idx) => (
                    <tr
                      key={row.vehicleId}
                      className={cn(
                        'border-b border-slate-100',
                        idx % 2 === 1 && 'bg-[#f8fafc]'
                      )}
                    >
                      {columns.map((col) => {
                        if (col.id === 'action') {
                          return (
                            <td key={col.id} className="px-5 py-3 text-right">
                              <button
                                type="button"
                                className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                onClick={() => {
                                  onNavigateToVehicle?.(row.vehicleId, row.coordinates);
                                  onOpenChange(false);
                                }}
                              >
                                Voir sur carte
                              </button>
                            </td>
                          );
                        }
                        const value = getCellValue(row, col.id);
                        const isVehicleCol = col.id === 'licensePlate';
                        return (
                          <td
                            key={col.id}
                            className={cn(
                              'px-5 py-3',
                              col.id === 'alertDateTime' &&
                                'whitespace-nowrap text-slate-500',
                              (col.id === 'location' || col.id === 'detail') &&
                                'text-slate-500'
                            )}
                          >
                            {isVehicleCol ? (
                              <button
                                type="button"
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                                onClick={() => {
                                  if (onSelectVehicle) {
                                    onSelectVehicle(row.vehicleId);
                                  } else {
                                    onNavigateToVehicle?.(row.vehicleId, row.coordinates);
                                  }
                                  onOpenChange(false);
                                }}
                              >
                                {value}
                              </button>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <TableFooter
                currentPage={currentPage}
                totalItems={rows.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                showExports={false}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
