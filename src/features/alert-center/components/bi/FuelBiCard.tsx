import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FuelBiData, FuelMode } from '../../mocks/mockBiKpis';

interface FuelBiCardProps {
  data: FuelBiData;
  className?: string;
}

export function FuelBiCard({ data, className }: FuelBiCardProps) {
  const [mode, setMode] = useState<FuelMode>('raw');
  const isDrift = mode === 'drift';

  return (
    <div
      className={cn(
        'rounded-[14px] border bg-white p-[18px_20px]',
        isDrift ? 'min-w-0 flex-[1_1_100%]' : 'min-w-[340px] flex-[1.7]',
        className
      )}
      style={{ borderColor: '#E5E7EB' }}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <div className="text-[12.5px] font-bold" style={{ color: '#1E293B' }}>
            {isDrift
              ? 'Dérive carburant vs estimation constructeur'
              : 'Consommation carburant par véhicule'}
          </div>
          <div className="mt-0.5 text-[11px]" style={{ color: '#94A3B8' }}>
            {isDrift
              ? 'Chaque véhicule comparé à sa propre fiche constructeur'
              : "Consommation par véhicule (%) · classement d'hier"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div
            className="inline-flex rounded-lg p-0.5"
            style={{ background: '#F1F5F9' }}
            role="tablist"
            aria-label="Mode carburant"
          >
            {(
              [
                { id: 'raw' as const, label: 'Brut' },
                { id: 'drift' as const, label: 'Dérive' },
              ] as const
            ).map((tab) => {
              const selected = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setMode(tab.id)}
                  className="rounded-md px-2.5 py-1 text-[10.5px] font-bold"
                  style={{
                    background: selected ? '#fff' : 'transparent',
                    color: selected ? '#0F172A' : '#64748B',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
          <span
            className="whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10.5px] font-bold"
            style={{ background: '#FEF3C7', color: '#B45309' }}
          >
            Hier (J-1)
          </span>
        </div>
      </div>

      {!isDrift ? (
        <>
          <div className="mt-2.5">
            <span className="text-[30px] font-bold" style={{ color: '#B45309' }}>
              {data.avgPct}
            </span>
            <span className="text-[13px] font-semibold" style={{ color: '#94A3B8' }}>
              {' '}
              %
            </span>
            <div className="mt-0.5 text-[11px]" style={{ color: '#64748B' }}>
              Consommation moyenne des véhicules affichés
            </div>
          </div>
          <div className="mt-4">
            {data.bars.map((bar) => (
              <div key={bar.plate} className="mb-2.5 flex items-center gap-2.5">
                <div className="w-[92px] shrink-0 text-[11.5px] font-semibold" style={{ color: '#334155' }}>
                  {bar.plate}
                </div>
                <div className="h-2.5 flex-1 rounded-md" style={{ background: '#FEF3C7' }}>
                  <div
                    className="h-full rounded-md"
                    style={{ width: `${bar.w}%`, background: '#F59E0B' }}
                  />
                </div>
                <div
                  className="w-[52px] text-right text-[11.5px] font-bold"
                  style={{ color: '#B45309' }}
                >
                  {bar.pct} %
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
            <div className="rounded-[10px] px-4 py-3.5" style={{ background: '#F8FAFC' }}>
              <div className="text-[11.5px]" style={{ color: '#64748B' }}>
                Indice de dérive
              </div>
              <div className="mt-1 text-[28px] font-bold" style={{ color: '#DC2626' }}>
                {data.driftIndex}
              </div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: '#94A3B8' }}>
                vs estimation constructeur
              </div>
            </div>
            <div className="rounded-[10px] px-4 py-3.5" style={{ background: '#F8FAFC' }}>
              <div className="text-[11.5px]" style={{ color: '#64748B' }}>
                Réel / estimé
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: '#0F172A' }}>
                {data.avgFuel}
                <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>
                  {' '}
                  / {data.avgEst}
                </span>
              </div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: '#94A3B8' }}>
                L/100km, moyenne parc
              </div>
            </div>
            <div className="rounded-[10px] px-4 py-3.5" style={{ background: '#F8FAFC' }}>
              <div className="text-[11.5px]" style={{ color: '#64748B' }}>
                Surcoût de la dérive
              </div>
              <div className="mt-1 text-2xl font-bold" style={{ color: '#0F172A' }}>
                {data.driftCostDay}
                <span className="text-sm font-semibold" style={{ color: '#94A3B8' }}>
                  {' '}
                  DT/j
                </span>
              </div>
              <div className="mt-0.5 text-[10.5px]" style={{ color: '#94A3B8' }}>
                {data.driftLitersDay} L perdus hier
              </div>
            </div>
          </div>

          <div className="my-4 flex flex-wrap items-center gap-4">
            {data.driftLegend.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: item.color }}
                />
                <span className="text-[11px]" style={{ color: '#64748B' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="rounded-xl border px-4 py-3.5" style={{ borderColor: '#E5E7EB' }}>
            <div className="mb-3 flex items-center gap-3">
              <div className="w-[200px] shrink-0" />
              <div className="relative h-[13px] flex-1">
                <span
                  className="absolute text-[10.5px]"
                  style={{ left: '22%', color: '#94A3B8', transform: 'translateX(-50%)' }}
                >
                  0%
                </span>
                <span
                  className="absolute text-[10.5px]"
                  style={{ left: '60%', color: '#94A3B8', transform: 'translateX(-50%)' }}
                >
                  +50%
                </span>
                <span
                  className="absolute whitespace-nowrap text-[10.5px]"
                  style={{ left: '98%', color: '#94A3B8', transform: 'translateX(-50%)' }}
                >
                  +100%
                </span>
              </div>
              <div className="w-24 shrink-0" />
            </div>
            {data.driftBars.map((bar) => (
              <div key={bar.plate} className="mb-3 flex items-center gap-3">
                <div className="w-[200px] shrink-0">
                  <div className="text-[12.5px] font-bold" style={{ color: '#0F172A' }}>
                    {bar.plate}
                  </div>
                  <div className="whitespace-nowrap text-[10.5px]" style={{ color: '#94A3B8' }}>
                    {bar.est} → {bar.real} L/100km
                  </div>
                </div>
                <div
                  className="relative h-5 flex-1 rounded-md"
                  style={{ background: '#F8FAFC' }}
                >
                  <div
                    className="absolute bottom-[-4px] top-[-4px] w-px"
                    style={{ left: '22%', background: '#CBD5E1' }}
                  />
                  <div
                    className="absolute top-[3px] h-3.5"
                    style={{
                      left: `${bar.barLeft}%`,
                      width: `${bar.barW}%`,
                      background: bar.color,
                      borderRadius:
                        bar.barLeft < 22 ? '6px 0 0 6px' : '0 6px 6px 0',
                    }}
                  />
                </div>
                <div className="w-24 shrink-0 text-right">
                  <div className="text-[13px] font-bold" style={{ color: bar.color }}>
                    {bar.drift}
                  </div>
                  <div className="text-[10.5px]" style={{ color: '#94A3B8' }}>
                    {bar.cost} DT/j
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div
        className="mt-3 flex flex-wrap items-baseline gap-2 border-t border-dashed pt-2.5"
        style={{ borderColor: '#E5E7EB' }}
      >
        <span
          className="text-[10.5px] font-bold uppercase tracking-wider"
          style={{ color: '#94A3B8' }}
        >
          Coût carburant estimé
        </span>
        <span className="text-[15px] font-bold" style={{ color: '#0F172A' }}>
          {data.costDay}
          <span className="text-[11px] font-semibold" style={{ color: '#64748B' }}>
            {' '}
            DT/jour
          </span>
        </span>
        <span className="text-[10.5px]" style={{ color: '#64748B' }}>
          ≈ {data.costMonth} DT/mois · {data.litersDay} L · {data.fleetKm} km · gasoil{' '}
          {data.fuelPrice} DT/L
        </span>
      </div>
    </div>
  );
}
