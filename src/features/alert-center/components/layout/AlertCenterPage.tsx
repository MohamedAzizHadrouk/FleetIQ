import { useEffect, useMemo, useState } from 'react';
import { Clock } from 'lucide-react';
import type { Vehicle } from '@/types';
import { initAlertStore, getUnreadCount } from '../../api/alert-api';
import { useAlertCenterContext } from '../../context/AlertCenterContext';
import { getBiKpis, type BiPeriod } from '../../mocks/mockBiKpis';
import { BiLayerToggle } from '../bi/BiLayerToggle';
import { BiPeriodFilter } from '../bi/BiPeriodFilter';
import { GlobalAlertSectionsDashboard } from '../dashboard/GlobalAlertSectionsDashboard';
import { VehicleInspectionView } from '../inspection/VehicleInspectionView';

interface AlertCenterPageProps {
  vehicles: Vehicle[];
  onNavigateToVehicle?: (vehicleId: string, coordinates: [number, number]) => void;
  onOpenHistory?: (vehicleIds?: string[]) => void;
  onUnreadCountChange?: (count: number) => void;
}

/** Webtrace-parity layout: single column, #f4f6f8, no vehicle inspector panel. */
export function AlertCenterPage({
  vehicles,
  onNavigateToVehicle,
  onOpenHistory,
  onUnreadCountChange,
}: AlertCenterPageProps) {
  const { refreshUnreadCount } = useAlertCenterContext();
  const [biOn, setBiOn] = useState(true);
  const [period, setPeriod] = useState<BiPeriod>('jour');
  const [view, setView] = useState<'dashboard' | 'inspection'>('dashboard');
  const [selectedPlate, setSelectedPlate] = useState<string | null>(null);
  const biKpis = useMemo(() => getBiKpis(period), [period]);

  useEffect(() => {
    initAlertStore(vehicles);
    refreshUnreadCount();
  }, [vehicles, refreshUnreadCount]);

  const unreadCount = getUnreadCount();

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
    refreshUnreadCount();
  }, [unreadCount, onUnreadCountChange, refreshUnreadCount]);

  return (
    <div className="h-full w-full overflow-y-auto" style={{ background: '#f4f6f8' }}>
      <div className="box-border flex w-full flex-col gap-[1.15rem] px-4 pb-6 pt-4">
        {view === 'inspection' && selectedPlate ? (
          <VehicleInspectionView
            plate={selectedPlate}
            onBack={() => {
              setView('dashboard');
              setSelectedPlate(null);
            }}
          />
        ) : null}
        {view === 'dashboard' ? (
        <>
        <div className="flex flex-wrap items-start justify-between gap-3.5">
          <div>
            <h1
              className="font-bold leading-tight"
              style={{ fontSize: '1.75rem', color: '#1e293b' }}
            >
              Centre d&apos;alertes
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#64748b' }}>
              {unreadCount} alerte(s) non lue(s)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <BiPeriodFilter value={period} onChange={setPeriod} />
            <BiLayerToggle enabled={biOn} onChange={setBiOn} />
            {onOpenHistory ? (
              <button
                type="button"
                onClick={() => onOpenHistory()}
                className="inline-flex items-center gap-1.5 rounded-[10px] border bg-white px-3.5 py-2 text-[13px] font-semibold transition-colors hover:bg-slate-50"
                style={{ borderColor: '#E5E7EB', color: '#1E293B' }}
              >
                <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden />
                Historique
              </button>
            ) : null}
          </div>
        </div>

        <GlobalAlertSectionsDashboard
          onNavigateToVehicle={onNavigateToVehicle}
          biOn={biOn}
          biKpis={biKpis}
          onInspectVehicle={(plate) => {
            setSelectedPlate(plate);
            setView('inspection');
          }}
        />
        </>
        ) : null}
      </div>
    </div>
  );
}
