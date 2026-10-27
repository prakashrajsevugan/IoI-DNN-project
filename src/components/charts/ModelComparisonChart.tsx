import { useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { formatTime } from '../../utils/format';
import type { ModelComparisonPoint } from '../../types';
import { LoadingSpinner } from '../ui/SharedComponents';

interface Props {
  data: ModelComparisonPoint[];
  loading?: boolean;
}

const SERIES = [
  { key: 'actual', label: 'Actual Demand', color: '#0f172a', strokeDash: undefined },
  { key: 'dnn_lstm', label: 'DNN/LSTM', color: '#2563eb', strokeDash: undefined },
  { key: 'patchtst', label: 'PatchTST', color: '#059669', strokeDash: '5 3' },
  { key: 'timesfm', label: 'TimesFM 2.5', color: '#7c3aed', strokeDash: '3 3' },
] as const;

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

export function ModelComparisonChart({ data, loading }: Props) {
  const [visible, setVisible] = useState<Record<string, boolean>>({
    actual: true, dnn_lstm: true, patchtst: true, timesfm: true,
  });

  const toggle = (key: string) => setVisible(prev => ({ ...prev, [key]: !prev[key] }));

  const chartData = data.map(pt => ({ time: formatTime(pt.timestamp), ...pt }));

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Model Forecast Trajectory Comparison</h3>
          <p className="text-xs text-slate-500 mt-0.5">Toggle model layers to evaluate dynamic tracking against ground truth</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SERIES.map(s => {
            const isVisible = visible[s.key];
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  isVisible
                    ? 'border-transparent text-slate-900 shadow-xs'
                    : 'border-slate-200 text-slate-400 opacity-50 hover:opacity-80'
                }`}
                style={isVisible ? { backgroundColor: `${s.color}10`, borderColor: `${s.color}30`, color: s.color } : {}}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: isVisible ? s.color : '#94a3b8' }} />
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 h-84">
        {loading ? (
          <LoadingSpinner message="Calculating model trajectories..." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
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
              {SERIES.map(s =>
                visible[s.key] ? (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={s.key === 'actual' ? 2.5 : 1.75}
                    strokeDasharray={s.strokeDash}
                    dot={false}
                    activeDot={{ r: 4, stroke: s.color, strokeWidth: 2, fill: '#ffffff' }}
                  />
                ) : null
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
