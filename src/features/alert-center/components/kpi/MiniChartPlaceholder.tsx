import { Area, AreaChart, ResponsiveContainer } from 'recharts';

const SPARKLINE_DATA = [
  { v: 4 }, { v: 7 }, { v: 5 }, { v: 9 }, { v: 6 }, { v: 8 }, { v: 10 },
];

interface MiniChartPlaceholderProps {
  color?: string;
}

export function MiniChartPlaceholder({ color = '#3b82f6' }: MiniChartPlaceholderProps) {
  return (
    <div className="h-8 w-16 opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={SPARKLINE_DATA}>
          <Area type="monotone" dataKey="v" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
