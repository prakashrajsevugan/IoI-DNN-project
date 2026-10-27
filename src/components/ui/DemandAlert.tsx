import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

interface DemandAlertProps {
  predictedKW: number;
  capacityKW: number;
  expectedPeakTime: string;
  thresholdPct?: number;
}

export function DemandAlert({
  predictedKW,
  capacityKW,
  expectedPeakTime,
  thresholdPct = 90,
}: DemandAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const availableKW = capacityKW - predictedKW;
  const utilizationPct = (predictedKW / capacityKW) * 100;
  const isOverload = predictedKW >= capacityKW;
  const isHighRisk = utilizationPct >= thresholdPct;
  const isAlert = isHighRisk || isOverload;

  if (!isAlert) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
        <span className="text-sm text-emerald-800 font-medium">
          Load Nominal — Projected {predictedKW.toFixed(1)} kW within {capacityKW} kW dual-station capacity
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex flex-col gap-3 px-5 py-4 rounded-xl border ${
        isOverload
          ? 'border-rose-200 bg-rose-50/80'
          : 'border-amber-200 bg-amber-50/80'
      }`}
    >
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3.5 right-3.5 text-slate-400 hover:text-slate-600"
        aria-label="Dismiss alert"
      >
        <X size={14} />
      </button>

      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className={isOverload ? 'text-rose-600' : 'text-amber-600'} />
        <span className={`text-sm font-bold ${isOverload ? 'text-rose-800' : 'text-amber-800'}`}>
          {isOverload ? 'PEAK OVERLOAD WARNING' : 'APPROACHING PEAK CAPACITY'}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <p className="text-slate-500 mb-0.5 font-medium">Predicted Peak</p>
          <p className="font-semibold text-slate-900">{predictedKW.toFixed(1)} kW</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5 font-medium">Expected Time</p>
          <p className="font-semibold text-slate-900">{expectedPeakTime}</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5 font-medium">Total Rated Limit</p>
          <p className="font-semibold text-slate-900">{capacityKW} kW</p>
        </div>
        <div>
          <p className="text-slate-500 mb-0.5 font-medium">Available Headroom</p>
          <p className={`font-semibold ${availableKW < 0 ? 'text-rose-700 font-bold' : 'text-slate-900'}`}>
            {availableKW.toFixed(1)} kW
          </p>
        </div>
      </div>

      {/* Utilization bar */}
      <div className="pt-1">
        <div className="flex justify-between text-[11px] text-slate-500 mb-1 font-medium">
          <span>Grid Utilization</span>
          <span className="font-bold">{utilizationPct.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isOverload ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, utilizationPct)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
