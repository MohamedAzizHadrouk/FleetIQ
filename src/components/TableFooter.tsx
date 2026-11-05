import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet } from
'lucide-react';
import { cn } from '@/lib/utils';
interface TableFooterProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onExportPdf?: () => void;
  onExportExcel?: () => void;
  showExports?: boolean;
  className?: string;
}
export function TableFooter({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onExportPdf,
  onExportExcel,
  showExports = true,
  className
}: TableFooterProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  return (
    <div className={cn('flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200', className)}>
      {/* Left: Export Buttons */}
      {showExports && (
      <div className="flex items-center gap-3">
        <button
          onClick={onExportPdf}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 transition-colors group"
          title="Export PDF">
          
          <div className="relative flex items-center justify-center">
            <FileText className="w-6 h-6 text-red-600" strokeWidth={1.5} />
            <span className="absolute text-[8px] font-bold text-red-600 mt-1">
              PDF
            </span>
          </div>
        </button>
        <button
          onClick={onExportExcel}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-100 transition-colors group"
          title="Export Excel">
          
          <div className="relative flex items-center justify-center">
            <FileSpreadsheet
              className="w-6 h-6 text-green-600"
              strokeWidth={1.5} />
            
            <span className="absolute text-[8px] font-bold text-green-600 mt-1 ml-0.5">
              XLS
            </span>
          </div>
        </button>
      </div>
      )}
      {!showExports && <div />}

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1); // Reset to first page when changing items per page
            }}
            className="border-none bg-transparent focus:ring-0 cursor-pointer font-medium text-slate-700">
            
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="font-medium">
          {totalItems === 0 ?
          '0 - 0 of 0' :
          `${startItem} - ${endItem} of ${totalItems}`}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1 || totalItems === 0}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalItems === 0}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>);

}