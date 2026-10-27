import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ReactNode } from 'react';

interface KPICardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  unit?: string;
  subLabel?: string;
  change?: number;
  accentColor?: string;
  loading?: boolean;
}

export function KPICard({
  icon,
  label,
  value,
  unit,
  subLabel,
  change,
  accentColor = '#2563eb',
  loading = false,
}: KPICardProps) {
  const trendPositive = change !== undefined && change > 0;
  const trendNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        {icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: `${accentColor}12`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">{value}</span>
          {unit && <span className="text-xs text-slate-500 font-semibold">{unit}</span>}
        </div>
      )}

      {(change !== undefined || subLabel) && (
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
          {change !== undefined && (
            <span
              className={`flex items-center gap-0.5 text-xs font-bold font-mono ${
                trendPositive ? 'text-emerald-600' : trendNegative ? 'text-rose-600' : 'text-slate-400'
              }`}
            >
              {trendPositive ? <TrendingUp size={13} /> : trendNegative ? <TrendingDown size={13} /> : <Minus size={13} />}
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
          {subLabel && (
            <span className="text-[11px] text-slate-400 truncate">
              {change !== undefined ? `vs baseline` : subLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
