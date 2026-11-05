import {
  AlertCircle,
  AlertTriangle,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlertKpiData } from '@/types/alerts';
import { AnimatedKpiCard } from './AnimatedKpiCard';
import { AlertKpiSkeleton } from '../states/AlertFeedSkeleton';

interface AlertKpiGridProps {
  data?: AlertKpiData;
  isLoading?: boolean;
  className?: string;
}

export function AlertKpiGrid({ data, isLoading, className }: AlertKpiGridProps) {
  if (isLoading || !data) return <AlertKpiSkeleton className={className} />;

  const cards = [
    { title: 'Alertes critiques', value: data.critical, trend: data.trends.critical, icon: AlertCircle, iconColor: 'text-rose-600', iconBg: 'bg-rose-50', chartColor: '#e11d48' },
    { title: 'Alertes élevées', value: data.high, trend: data.trends.high, icon: AlertTriangle, iconColor: 'text-orange-600', iconBg: 'bg-orange-50', chartColor: '#ea580c' },
    { title: 'Alertes moyennes', value: data.medium, trend: data.trends.medium, icon: AlertTriangle, iconColor: 'text-amber-600', iconBg: 'bg-amber-50', chartColor: '#d97706' },
    { title: 'Total alertes', value: data.total, trend: data.trends.total, icon: Bell, iconColor: 'text-indigo-600', iconBg: 'bg-indigo-50', chartColor: '#4f46e5' },
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4', className)}>
      {cards.map((card, i) => (
        <AnimatedKpiCard key={card.title} {...card} index={i} />
      ))}
    </div>
  );
}
