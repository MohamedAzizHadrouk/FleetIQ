import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function AlertKpiSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}

export function AlertFeedSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl" />
      ))}
    </div>
  );
}

export function DrawerSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
