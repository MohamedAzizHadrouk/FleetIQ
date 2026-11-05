import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GROUP_META, SUBS } from '../constants';
import { formatDT } from '../lib/format';
import {
  chartTitleForFilters,
  monthIndicesForPeriod,
  monthLabelsForPeriod,
} from '../lib/period-labels';
import { BLUE_SCALE } from '../lib/status-colors';
import type { ActorType, PeriodPreset, SubRubriqueKey } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

/** Platform blue degradations — dark → light. */
const SERIES_COLORS = [...BLUE_SCALE];

function scaleRank(hex: string | undefined): number {
  if (!hex) return SERIES_COLORS.length;
  const i = SERIES_COLORS.findIndex(
    (c) => c.toLowerCase() === hex.toLowerCase()
  );
  return i >= 0 ? i : SERIES_COLORS.length;
}

/** Stable order: darkest blue first → lightest. */
function sortByBlueScale<T>(items: T[], colorOf: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => scaleRank(colorOf(a)) - scaleRank(colorOf(b))
  );
}

interface ExpensesMonthlyChartProps {
  actorType: ActorType;
  period: PeriodPreset;
  entities: string[];
  subs: SubRubriqueKey[];
  byMonth: Record<SubRubriqueKey, number>[];
  byMonthEnt: Record<string, number>[];
  byEnt: Record<string, number>;
}

function formatYTick(value: number): string {
  if (value === 0) return '0 DT';
  if (Math.abs(value) >= 1000) {
    const k = value / 1000;
    const label = Number.isInteger(k) ? String(k) : k.toFixed(1);
    return `${label}k DT`;
  }
  return `${Math.round(value)} DT`;
}

export function ExpensesMonthlyChart({
  actorType,
  period,
  entities,
  subs,
  byMonth,
  byMonthEnt,
}: ExpensesMonthlyChartProps) {
  const isGroup = actorType === 'dep' || actorType === 'spe';
  const { title, subtitle } = chartTitleForFilters(actorType, period);
  const monthIdx = monthIndicesForPeriod(period);
  const labels = monthLabelsForPeriod(period);
  const seriesCount = isGroup ? entities.length : subs.length;

  const chartData = useMemo((): ChartData<'bar'> => {
    const barStyle = {
      borderWidth: 0,
      borderRadius: {
        topLeft: 6,
        topRight: 6,
        bottomLeft: 0,
        bottomRight: 0,
      },
      borderSkipped: false as const,
      // Chunkier bars + tight gap inside a month cluster
      barPercentage: 0.88,
      // Wide gap between month groups (matches reference design)
      categoryPercentage: seriesCount > 6 ? 0.72 : 0.58,
      maxBarThickness: 36,
    };

    if (isGroup) {
      const colors = GROUP_META[actorType].colors;
      const ordered = sortByBlueScale(
        entities,
        (entity) => colors[entity] ?? ''
      );
      return {
        labels,
        datasets: ordered.map((entity, index) => ({
          label: entity,
          data: monthIdx.map((i) => byMonthEnt[i]?.[entity] || 0),
          backgroundColor:
            colors[entity] ?? SERIES_COLORS[index % SERIES_COLORS.length],
          order: index,
          ...barStyle,
        })),
      };
    }

    const orderedSubs = sortByBlueScale(subs, (sub) => SUBS[sub].color);
    return {
      labels,
      datasets: orderedSubs.map((sub, index) => ({
        label: SUBS[sub].name,
        data: monthIdx.map((i) => byMonth[i]?.[sub] || 0),
        backgroundColor:
          SUBS[sub].color || SERIES_COLORS[index % SERIES_COLORS.length],
        order: index,
        ...barStyle,
      })),
    };
  }, [
    isGroup,
    actorType,
    entities,
    subs,
    byMonth,
    byMonthEnt,
    labels,
    monthIdx,
    seriesCount,
  ]);

  const options = useMemo((): ChartOptions<'bar'> => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'bottom',
          align: 'center',
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: false,
            padding: 16,
            color: '#64748b',
            font: {
              size: 11,
              family: 'inherit',
            },
            // Keep legend in the same dark → light scale order
            sort: (a, b) => (a.datasetIndex ?? 0) - (b.datasetIndex ?? 0),
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          padding: 12,
          cornerRadius: 8,
          boxPadding: 4,
          // Same order as bars / scale (not by amount)
          itemSort: (a, b) => a.datasetIndex - b.datasetIndex,
          callbacks: {
            title: (items) => {
              const month = items[0]?.label ?? '';
              return month ? `Mois · ${month}` : '';
            },
            label: (ctx: TooltipItem<'bar'>) => {
              const value = typeof ctx.parsed.y === 'number' ? ctx.parsed.y : 0;
              return ` ${ctx.dataset.label ?? ''}: ${formatDT(value)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: false,
          grid: { display: false, drawTicks: false },
          ticks: {
            color: '#94a3b8',
            font: { size: 12, family: 'inherit' },
            maxRotation: 0,
            autoSkip: period === 3 ? true : false,
            padding: 8,
          },
          border: { display: false },
        },
        y: {
          stacked: false,
          beginAtZero: true,
          grace: '4%',
          grid: {
            color: '#e5e7eb',
            drawTicks: false,
          },
          ticks: {
            color: '#94a3b8',
            font: { size: 11, family: 'inherit' },
            padding: 8,
            callback: (value) => {
              const n = typeof value === 'number' ? value : Number(value);
              return formatYTick(n);
            },
          },
          border: { display: false },
        },
      },
    };
  }, [period]);

  return (
    <Card className="border-0 bg-transparent shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-0 pb-1 pt-1">
        <CardTitle className="text-sm font-semibold text-slate-800">
          {title}
        </CardTitle>
        <span className="text-[11px] text-slate-400">{subtitle}</span>
      </CardHeader>
      <CardContent className="px-0 pb-2 pt-2">
        <div className="h-[340px] w-full">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
