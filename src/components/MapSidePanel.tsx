import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MapSidePanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function MapSidePanel({ children, className, ...props }: MapSidePanelProps) {
  return (
    <div
      className={cn(
        'h-full flex flex-col bg-white/95 backdrop-blur-md border-r border-slate-200/50 shadow-2xl',
        'w-full max-w-full',
        'lg:w-[360px] lg:max-w-[360px]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
