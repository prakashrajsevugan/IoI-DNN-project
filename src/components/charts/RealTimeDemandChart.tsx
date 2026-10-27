import { useState, useCallback } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';
import { formatTime } from '../../utils/format';
import type { DemandPoint } from '../../types';
import { LoadingSpinner } from '../ui/SharedComponents';

const TIME_RANGES = ['1H', '6H', '12H', '24H'] as const;
type Range = typeof TIME_RANGES[number];

const RANGE_POINTS: Record<Range, number> = {
  '1H': 12, '6H': 72, '12H': 144, '24H': 288,
};

interface Props {
  data: DemandPoint[];
  loading?: boolean;
  onRangeChange?: (range: string) => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-md">
      <p className="text-slate-500 font-mono mb-2 pb-1 border-b border-slate-100">{label}</p>
      <div className="space-y-1.5">
        {payload.map((p: any) => (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-600 font-medium">{p.name}</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{p.value?.toFixed(2)} kW</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function RealTimeDemandChart({ data, loading, onRangeChange }: Props) {
  const [range, setRange] = useState<Range>('24H');

  const handleRange = useCallback((r: Range) => {
    setRange(r);
    onRangeChange?.(r);
  }, [onRangeChange]);

  const sliced = data.slice(-RANGE_POINTS[range]);
  const chartData = sliced.map(pt => ({
    time: formatTime(pt.timestamp),
    'Combined Demand': pt.demand_kw,
    'Rolling Average': pt.moving_avg,
  }));

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Combined 2-Station Charging Demand</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time aggregated power load from Station 1 & Station 2</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {TIME_RANGES.map(r => (
            <button
              key={r}
              onClick={() => handleRange(r)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                range === r
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 h-76">
        {loading ? (
          <LoadingSpinner message="Streaming 2-station demand telemetry..." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                minTickGap={35}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v} kW`}
                width={65}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#475569', paddingTop: '10px' }}
              />
              <Line
                type="monotone"
                dataKey="Combined Demand"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
              />
              <Line
                type="monotone"
                dataKey="Rolling Average"
                stroke="#0891b2"
                strokeWidth={1.5}
                strokeDasharray="4 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
