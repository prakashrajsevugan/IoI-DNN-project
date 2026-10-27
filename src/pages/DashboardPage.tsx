import { useCallback } from 'react';
import { Zap, Battery, AlertTriangle, Activity } from 'lucide-react';
import { usePolling } from '../hooks/usePolling';
import {
  getAllStationsData, getKPISummary, getDemandHistory,
} from '../services/api';
import { KPICard } from '../components/ui/KPICard';
import { RealTimeDemandChart } from '../components/charts/RealTimeDemandChart';
import { StatusDot, LoadingSpinner, ErrorState, Card, PageHeader } from '../components/ui/SharedComponents';
import { formatSecondsAgo } from '../utils/format';
import { useElapsedSeconds } from '../hooks/usePolling';
import type { StationData } from '../types';

function StationTelemetryCard({
  station,
  title,
  bayNumber,
}: {
  station: StationData | undefined;
  title: string;
  bayNumber: string;
}) {
  if (!station) {
    return (
      <Card title={title}>
        <div className="p-6">
          <LoadingSpinner message="Waiting for station telemetry..." />
        </div>
      </Card>
    );
  }

  const isCharging = station.charging;

  return (
    <Card
      title={title}
      titleRight={
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500">{station.station_id}</span>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            isCharging
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isCharging ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {isCharging ? 'CHARGING' : 'AVAILABLE'}
          </span>
        </div>
      }
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-500 font-medium">{bayNumber}</p>
            <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">
              {station.power_kw.toFixed(2)} <span className="text-sm font-semibold text-slate-500">kW</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 font-medium">Session Energy</p>
            <p className="text-lg font-bold font-mono text-blue-600 mt-0.5">
              {station.energy_kwh.toFixed(2)} <span className="text-xs text-slate-500">kWh</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Line Voltage</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {station.voltage} <span className="text-xs font-normal text-slate-500">V</span>
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Current Draw</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {station.current} <span className="text-xs font-normal text-slate-500">A</span>
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function DashboardPage() {
  const stationsFetcher = useCallback(() => getAllStationsData(), []);
  const kpiFetcher = useCallback(() => getKPISummary(), []);
  const demandFetcher = useCallback(() => getDemandHistory('24h'), []);

  const stations = usePolling(stationsFetcher, 2500);
  const kpi = usePolling(kpiFetcher, 4000);
  const demand = usePolling(demandFetcher, 8000);

  const elapsed = useElapsedSeconds(stations.data?.[0]?.timestamp ?? null);

  const station1 = stations.data?.find(s => s.station_id === 'EV-STATION-01');
  const station2 = stations.data?.find(s => s.station_id === 'EV-STATION-02');

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="EV Charging Demand Overview"
        subtitle="Live telemetry and AI forecasting for 2 connected charging stations"
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
              <StatusDot online size="sm" />
              <span>ESP32 Gateway Online</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono">{formatSecondsAgo(elapsed)}</span>
            </div>
          </div>
        }
      />

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Zap size={16} />}
          label="Total Active Demand"
          value={kpi.data ? `${kpi.data.current_demand_kw.toFixed(2)}` : '—'}
          unit="kW"
          change={kpi.data?.current_demand_change_pct}
          accentColor="#2563eb"
          loading={kpi.loading && !kpi.data}
        />
        <KPICard
          icon={<Activity size={16} />}
          label="Active Charging Stations"
          value={kpi.data ? `${kpi.data.active_sessions} / ${kpi.data.total_chargers}` : '—'}
          subLabel={kpi.data?.active_sessions === 2 ? 'Both stations active' : '1 station idle'}
          accentColor="#059669"
          loading={kpi.loading && !kpi.data}
        />
        <KPICard
          icon={<Battery size={16} />}
          label="Energy Delivered Today"
          value={kpi.data ? `${kpi.data.today_energy_kwh.toFixed(1)}` : '—'}
          unit="kWh"
          subLabel="Cumulative load"
          accentColor="#d97706"
          loading={kpi.loading && !kpi.data}
        />
        <KPICard
          icon={<AlertTriangle size={16} />}
          label="Predicted Peak Load"
          value={kpi.data ? `${kpi.data.predicted_peak_kw.toFixed(1)}` : '—'}
          unit="kW"
          subLabel={kpi.data ? `Expected at ${kpi.data.predicted_peak_time}` : undefined}
          accentColor="#7c3aed"
          loading={kpi.loading && !kpi.data}
        />
      </div>

      {/* Two Dedicated Charging Stations Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <StationTelemetryCard
          title="Station 1 Telemetry"
          bayNumber="Charging Bay A (EV-STATION-01)"
          station={station1}
        />
        <StationTelemetryCard
          title="Station 2 Telemetry"
          bayNumber="Charging Bay B (EV-STATION-02)"
          station={station2}
        />
      </div>

      {/* Clean Single Real-Time Demand Graph */}
      {demand.error && !demand.data ? (
        <ErrorState message="Could not load demand stream." onRetry={demand.refetch} />
      ) : (
        <RealTimeDemandChart
          data={demand.data ?? []}
          loading={demand.loading && !demand.data}
        />
      )}
    </div>
  );
}
