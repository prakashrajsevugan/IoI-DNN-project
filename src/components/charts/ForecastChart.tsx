import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { formatTime } from '../../utils/format';
import type { ForecastPoint } from '../../types';
import { LoadingSpinner } from '../ui/SharedComponents';

interface Props {
  data: ForecastPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload[0]?.payload?.is_forecast;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs shadow-md">
      <div className="flex items-center justify-between gap-3 mb-2 pb-1 border-b border-slate-100 font-mono">
        <span className="text-slate-500">{label}</span>
        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${isForecast ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}>
          {isForecast ? 'Predicted' : 'Historical'}
        </span>
      </div>
      <div className="space-y-1.5">
        {payload.map((p: any) => p.value != null && (
          <div key={p.name} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-600 font-medium">{p.name}:</span>
            </span>
            <span className="font-mono font-bold text-slate-900">{Number(p.value).toFixed(2)} kW</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function ForecastChart({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 h-84 shadow-xs flex items-center justify-center">
        <LoadingSpinner message="Generating 2-station demand forecast..." />
      </div>
    );
  }

  const nowIdx = data.findIndex(d => d.is_forecast);
  const nowLabel = nowIdx >= 0 ? formatTime(data[nowIdx].timestamp) : undefined;

  const chartData = data.map(pt => ({
    time: formatTime(pt.timestamp),
    Historical: !pt.is_forecast ? pt.demand_kw : undefined,
    Predicted: pt.is_forecast ? pt.demand_kw : undefined,
    upper_bound: pt.is_forecast ? pt.upper_bound : undefined,
    lower_bound: pt.is_forecast ? pt.lower_bound : undefined,
    is_forecast: pt.is_forecast,
  }));

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">24-Hour Demand Forecast (2 Stations)</h3>
          <p className="text-xs text-slate-500 mt-0.5">Historical telemetry combined with 95% AI confidence intervals</p>
        </div>
      </div>
      <div className="p-5 h-84">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="ciGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
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
            {/* Confidence interval area */}
            <Area
              type="monotone"
              dataKey="upper_bound"
              stroke="transparent"
              fill="url(#ciGradient)"
              name="Upper Bound (95% CI)"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey="lower_bound"
              stroke="transparent"
              fill="#ffffff"
              name="Lower Bound"
              legendType="none"
            />
            <Line
              type="monotone"
              dataKey="Historical"
              stroke="#2563eb"
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#ffffff' }}
            />
            <Line
              type="monotone"
              dataKey="Predicted"
              stroke="#7c3aed"
              strokeWidth={2.2}
              strokeDasharray="5 4"
              dot={false}
              activeDot={{ r: 4, stroke: '#7c3aed', strokeWidth: 2, fill: '#ffffff' }}
            />
            {nowLabel && (
              <ReferenceLine
                x={nowLabel}
                stroke="#0891b2"
                strokeDasharray="4 3"
                label={{ value: 'CURRENT TIME', fill: '#0891b2', fontSize: 10, position: 'top', fontWeight: 600 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
