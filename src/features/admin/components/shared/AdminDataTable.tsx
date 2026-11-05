import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminDataTableProps {
  headers: string[];
  loading?: boolean;
  emptyMessage?: string;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  children: ReactNode;
  className?: string;
}

export function AdminDataTable({
  headers,
  loading,
  emptyMessage = 'Aucun résultat',
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  children,
  className,
}: AdminDataTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900',
        className
      )}
    >
      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
            <tr>
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  Chargement...
                </td>
              </tr>
            ) : totalCount === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-5 py-10 text-center text-sm text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              children
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <span>
            {from}–{to} sur {totalCount}
          </span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800"
            disabled={loading}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="px-2 text-sm text-slate-600 dark:text-slate-300">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
