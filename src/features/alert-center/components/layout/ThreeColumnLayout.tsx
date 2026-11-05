import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ThreeColumnLayoutProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  showMobileFilters?: boolean;
  showMobileOverview?: boolean;
}

export function ThreeColumnLayout({
  left,
  center,
  right,
  showMobileFilters,
  showMobileOverview,
}: ThreeColumnLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <aside
        className={cn(
          'hidden xl:block w-[280px] shrink-0 border-r border-slate-800 h-full',
          showMobileFilters && 'block absolute inset-y-0 left-0 z-40 xl:relative'
        )}
      >
        {left}
      </aside>
      <main className="flex-1 min-w-0 min-h-0 overflow-hidden bg-slate-50">{center}</main>
      <aside
        className={cn(
          'hidden lg:flex w-[320px] shrink-0 h-full border-l border-slate-200 bg-white overflow-hidden',
          showMobileOverview && 'flex absolute inset-y-0 right-0 z-40 lg:relative shadow-xl'
        )}
      >
        {right}
      </aside>
    </div>
  );
}
