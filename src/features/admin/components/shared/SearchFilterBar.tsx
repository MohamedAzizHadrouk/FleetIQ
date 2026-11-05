import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFilterBarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  showFilterLabel?: boolean;
  children?: ReactNode;
}

export function SearchFilterBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  showFilterLabel = false,
  children,
}: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-10"
        />
      </div>
      {children ? (
        <div className="flex flex-wrap items-center gap-2">
          {showFilterLabel ? (
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              Filtres :
            </span>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
}
