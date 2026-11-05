import { cn } from '@/lib/utils';
import type { BiKpis } from '../../mocks/mockBiKpis';
import { FuelBiCard } from './FuelBiCard';
import { DriverRiskBiCard } from './DriverRiskBiCard';
import { TopCriticalAlertsBiCard } from './TopCriticalAlertsBiCard';
import { AlertSplitBiCard } from './AlertSplitBiCard';

interface BiKpiStripProps {
  data: BiKpis;
  className?: string;
}

export function BiKpiStrip({ data, className }: BiKpiStripProps) {
  return (
    <section className={cn('mb-1', className)} aria-label="KPIs clés — impact business">
      <div
        className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
        style={{ color: '#0F172A' }}
      >
        KPIs clés — impact business
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold normal-case tracking-normal"
          style={{ background: '#DBEAFE', color: '#2563EB' }}
        >
          Ajouté par la couche BI
        </span>
      </div>
      <div className="flex flex-wrap items-stretch gap-4">
        <FuelBiCard data={data.fuel} />
        <DriverRiskBiCard avgScore={data.driverAvgScore} bars={data.driverBars} />
        <TopCriticalAlertsBiCard
          bars={data.topCriticalAlerts}
          topLabel={data.topCriticalLabel}
          topCount={data.topCriticalCount}
        />
        <AlertSplitBiCard
          bars={data.alertSplit}
          total={data.alertTotal}
          topShare={data.alertTopShare}
        />
      </div>
    </section>
  );
}
