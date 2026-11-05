import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContentTwoColumnLayoutProps {
  center: ReactNode;
  right: ReactNode;
  showMobileOverview?: boolean;
}

export function ContentTwoColumnLayout({
  center,
  right,
  showMobileOverview,
}: ContentTwoColumnLayoutProps) {
  return (
    <div className="flex flex-1 min-h-0 overflow-hidden relative">
      <div className="flex-1 min-w-0 overflow-y-auto overscroll-contain bg-slate-50 dark:bg-slate-950">
        {center}
      </div>
      <aside
        className={cn(
          'hidden lg:flex w-[320px] shrink-0 h-full overflow-hidden border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
          showMobileOverview &&
            'flex absolute inset-y-0 right-0 z-40 w-[min(320px,100vw)] shadow-xl lg:relative lg:shadow-none'
        )}
      >
        {right}
      </aside>
    </div>
  );
}
