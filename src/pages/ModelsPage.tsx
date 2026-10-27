import { useCallback } from 'react';
import { useFetch } from '../hooks/usePolling';
import { getModelComparison, getModelComparisonChart } from '../services/api';
import { ModelComparisonChart } from '../components/charts/ModelComparisonChart';
import { LoadingSpinner, ErrorState, PageHeader, Badge, Card } from '../components/ui/SharedComponents';
import { CheckCircle2, Star, Activity } from 'lucide-react';

const STATUS_VARIANT: Record<string, 'blue' | 'green' | 'purple' | 'gray'> = {
  Primary: 'blue', Baseline: 'green', Best: 'purple', Experimental: 'gray',
};

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-1.5">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%`, background: color }}
      />
    </div>
  );
}

export function ModelsPage() {
  const metricsFetcher = useCallback(() => getModelComparison(), []);
  const chartFetcher = useCallback(() => getModelComparisonChart(), []);

  const { data: metrics, loading: mLoading, error: mError } = useFetch(metricsFetcher);
  const { data: chartData, loading: cLoading } = useFetch(chartFetcher);

  const bestR2 = metrics ? Math.max(...metrics.map(m => m.r_squared)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Model Comparison"
        subtitle="Benchmark evaluation of deep learning and foundation forecasting models"
        right={
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-medium">
            Dataset: 2 ESP32 IoT Nodes
          </div>
        }
      />

      {/* Loading / Error states */}
      {mLoading && !metrics && <LoadingSpinner message="Loading model metrics..." />}
      {mError && !metrics && <ErrorState message="Could not load AI model metrics from backend." />}

      {/* Model Benchmark Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {metrics.map(m => (
            <div
              key={m.model_name}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{m.model_name}</h3>
                    <div className="mt-1">
                      <Badge label={m.status} variant={STATUS_VARIANT[m.status] ?? 'gray'} />
                    </div>
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${m.color}15`, color: m.color }}
                  >
                    {m.status === 'Best' && <Star size={16} />}
                    {m.status === 'Primary' && <CheckCircle2 size={16} />}
                    {m.status === 'Baseline' && <Activity size={16} />}
                  </div>
                </div>

                <div className="space-y-3 mt-2">
                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">R² Score</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{m.r_squared.toFixed(2)}</span>
                    </div>
                    <MetricBar value={m.r_squared} max={1} color={m.color} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">MAPE</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{m.mape}%</span>
                    </div>
                    <MetricBar value={10 - m.mape} max={10} color={m.color} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">MAE (kW)</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{m.mae.toFixed(2)}</span>
                    </div>
                    <MetricBar value={1 - m.mae} max={1} color={m.color} />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">RMSE (kW)</span>
                      <span className="font-mono font-bold text-slate-900 tabular-nums">{m.rmse.toFixed(2)}</span>
                    </div>
                    <MetricBar value={1 - m.rmse} max={1} color={m.color} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Metrics Table with clean light styling */}
      {metrics && (
        <Card
          title="Performance Metrics Benchmark"
          subtitle="Empirical comparison of accuracy and error metrics across models"
        >
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="w-[28%] px-5 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Model Architecture
                  </th>
                  <th className="w-[14%] px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    MAE (kW) ↓
                  </th>
                  <th className="w-[14%] px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    RMSE (kW) ↓
                  </th>
                  <th className="w-[14%] px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    MAPE (%) ↓
                  </th>
                  <th className="w-[14%] px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    R² Score ↑
                  </th>
                  <th className="w-[16%] px-5 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.map((m) => (
                  <tr
                    key={m.model_name}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m.color }} />
                        <span className="font-semibold text-sm text-slate-900">{m.model_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-slate-700">
                      {m.mae.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-slate-700">
                      {m.rmse.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-xs tabular-nums text-slate-700">
                      {m.mape.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-mono text-xs tabular-nums font-bold ${m.r_squared === bestR2 ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {m.r_squared.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge label={m.status} variant={STATUS_VARIANT[m.status] ?? 'gray'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 text-xs text-slate-400 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span>↓ Lower is better &nbsp;·&nbsp; ↑ Higher is better</span>
            <span>Comparative Architecture Analysis</span>
          </div>
        </Card>
      )}

      {/* Model Forecast Comparison Chart */}
      <ModelComparisonChart data={chartData ?? []} loading={cLoading && !chartData} />

      {/* Model Architecture Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            name: 'DNN/LSTM',
            color: '#2563eb',
            desc: 'Deep Neural Network with Long Short-Term Memory cells. Purpose-built to capture sequential charging trends across both active charging bays.',
            role: 'Primary Model',
          },
          {
            name: 'PatchTST',
            color: '#059669',
            desc: 'Patch Time Series Transformer extracting subseries patches into tokens. Serves as a modern transformer baseline.',
            role: 'Transformer Baseline',
          },
          {
            name: 'TimesFM 2.5',
            color: '#7c3aed',
            desc: "Google Research zero-shot foundation model for time-series forecasting. Demonstrates generalized transferability.",
            role: 'Foundation Comparison',
          },
        ].map(m => (
          <Card key={m.name}>
            <div className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                  <h4 className="font-bold text-sm text-slate-900">{m.name}</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{m.desc}</p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {m.role}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
