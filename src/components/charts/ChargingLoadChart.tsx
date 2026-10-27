import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell,
} from 'recharts';
import type { HourlyData } from '../../types';
import { LoadingSpinner } from '../ui/SharedComponents';

interface Props {
  data: HourlyData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip text-xs">
      <p className="text-[var(--text-secondary)] mb-1">{label}:00</p>
      <p className="font-semibold text-[var(--text-primary)]">{payload[0]?.value?.toFixed(1)} kW</p>
    </div>
  );
};

export function ChargingLoadChart({ data, loading }: Props) {
  const maxDemand = Math.max(...data.map(d => d.demand_kw), 1);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Charging Load by Hour</h3>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">Average demand (kW) per hour of day</p>
      </div>
      <div className="p-4 h-60">
        {loading ? (
          <LoadingSpinner message="Loading load data..." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}kW`}
                width={46}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="demand_kw" radius={[3, 3, 0, 0]}>
                {data.map((entry) => {
                  const pct = entry.demand_kw / maxDemand;
                  const isPeak = pct > 0.75;
                  return (
                    <Cell
                      key={entry.hour}
                      fill={isPeak ? '#f59e0b' : '#3b82f6'}
                      fillOpacity={0.7 + pct * 0.3}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="px-5 pb-3 flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#3b82f6]/80" />Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]/80" />Peak (&gt;75% max)
        </span>
      </div>
    </div>
  );
}
