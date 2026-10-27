import { useCallback } from 'react';
import { Clock, TrendingUp, AlertTriangle, Flame } from 'lucide-react';
import { useFetch, usePolling } from '../hooks/usePolling';
import { getForecast, getForecastSummary } from '../services/api';
import { ForecastChart } from '../components/charts/ForecastChart';
import { DemandAlert } from '../components/ui/DemandAlert';
import { LoadingSpinner, ErrorState, PageHeader, Card } from '../components/ui/SharedComponents';

const HORIZON_BUTTONS = ['Next 15 min', 'Next 30 min', 'Next 1 hour', 'Next 6 hours', 'Next 24 hours'];

export function ForecastPage() {
  const forecastFetcher = useCallback(() => getForecast(), []);
  const summaryFetcher = useCallback(() => getForecastSummary(), []);

  const { data: forecastData, loading: fLoading, error: fError, refetch } = useFetch(forecastFetcher);
  const { data: summary } = usePolling(summaryFetcher, 15000);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Forecast"
        subtitle="AI-powered load projections across the 2 connected charging stations"
        right={
          <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 font-medium">
            Model: DNN / LSTM Primary
          </div>
        }
      />

      {/* Horizon selector */}
      <div className="flex flex-wrap gap-2">
        {HORIZON_BUTTONS.map((h, i) => (
          <button
            key={h}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              i === 2
                ? 'bg-blue-600 text-white border-transparent shadow-xs'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Forecast chart */}
      {fLoading && !forecastData && (
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <LoadingSpinner message="Generating forecast..." />
        </div>
      )}
      {fError && !forecastData && <ErrorState onRetry={refetch} />}
      {forecastData && <ForecastChart data={forecastData} />}

      {/* Forecast result cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Next 15 Minutes', value: summary.next_15m, icon: Clock, color: '#2563eb' },
            { label: 'Next 30 Minutes', value: summary.next_30m, icon: Clock, color: '#0891b2' },
            { label: 'Next 1 Hour', value: summary.next_1h, icon: TrendingUp, color: '#16a34a' },
            { label: 'Next 6 Hours Peak', value: summary.next_6h_peak, icon: Flame, color: '#d97706' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <Icon size={15} style={{ color }} />
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {value.toFixed(1)}<span className="text-xs font-normal text-slate-500 ml-1">kW</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Peak info and alert */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card title="Peak Demand Assessment">
            <div className="p-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Expected Peak Time</p>
                <p className="text-xl font-bold text-slate-900">{summary.expected_peak_time}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Grid Risk Level</p>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                  summary.peak_risk === 'HIGH'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : summary.peak_risk === 'MEDIUM'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <AlertTriangle size={12} />
                  {summary.peak_risk}
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col justify-center">
            <DemandAlert
              predictedKW={summary.next_6h_peak}
              capacityKW={7.4}
              expectedPeakTime={summary.expected_peak_time}
            />
          </div>
        </div>
      )}

      {/* Pipeline info */}
      <Card title="End-to-End Prediction Architecture">
        <div className="p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            {['ESP32 Node Telemetry', 'Preprocessing & Normalization', 'Feature Extraction', 'DNN / LSTM Model', 'Demand Forecast', 'Dashboard Dispatch'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium">{step}</span>
                {i < arr.length - 1 && <span className="text-slate-400">→</span>}
              </span>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
