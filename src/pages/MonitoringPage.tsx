import { useCallback, useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { usePolling } from '../hooks/usePolling';
import { getAllStationsData } from '../services/api';
import { LoadingSpinner, ErrorState, Card, PageHeader } from '../components/ui/SharedComponents';
import { formatSecondsAgo, formatTime } from '../utils/format';
import { useElapsedSeconds } from '../hooks/usePolling';
import { Wifi, Zap, Activity } from 'lucide-react';
import type { StationData } from '../types';

function useMultiSensorHistory(stations: StationData[] | null, maxPoints = 50) {
  const [history, setHistory] = useState<Array<{ time: string; s1_power: number; s2_power: number; total: number }>>([]);
  const prevTs = useRef<string | null>(null);

  useEffect(() => {
    if (!stations || stations.length < 2) return;
    const s1 = stations.find(s => s.station_id === 'EV-STATION-01');
    const s2 = stations.find(s => s.station_id === 'EV-STATION-02');
    if (!s1 || !s2) return;

    if (s1.timestamp === prevTs.current) return;
    prevTs.current = s1.timestamp;

    setHistory(h => {
      const point = {
        time: formatTime(s1.timestamp),
        s1_power: s1.power_kw,
        s2_power: s2.power_kw,
        total: +(s1.power_kw + s2.power_kw).toFixed(2),
      };
      return [...h, point].slice(-maxPoints);
    });
  }, [stations, maxPoints]);

  return history;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-md">
      <p className="text-slate-500 font-mono mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3">
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-mono font-bold text-slate-900">{p.value?.toFixed(2)} kW</span>
        </div>
      ))}
    </div>
  );
};

export function MonitoringPage() {
  const stationsFetcher = useCallback(() => getAllStationsData(), []);
  const { data: stations, loading, error, refetch } = usePolling(stationsFetcher, 2000);
  const elapsed = useElapsedSeconds(stations?.[0]?.timestamp ?? null);
  const history = useMultiSensorHistory(stations);

  const s1 = stations?.find(s => s.station_id === 'EV-STATION-01');
  const s2 = stations?.find(s => s.station_id === 'EV-STATION-02');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Station Monitoring"
        subtitle="Real-time IoT telemetry streamed from 2 ESP32 charging nodes"
        right={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>2 Nodes Synchronized</span>
            <span className="text-slate-400">·</span>
            <span>{formatSecondsAgo(elapsed)}</span>
          </div>
        }
      />

      {loading && !stations && <LoadingSpinner message="Connecting to ESP32 charging nodes..." />}
      {error && !stations && <ErrorState message="Could not stream telemetry." onRetry={refetch} />}

      {stations && (
        <>
          {/* Side-by-side 2 Station Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { station: s1, name: 'Charging Station 1', bay: 'Bay A (EV-STATION-01)', color: '#2563eb' },
              { station: s2, name: 'Charging Station 2', bay: 'Bay B (EV-STATION-02)', color: '#0891b2' },
            ].map(({ station, name, bay, color }) => (
              <Card
                key={name}
                title={name}
                subtitle={bay}
                titleRight={
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    station?.charging
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${station?.charging ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                    {station?.charging ? 'CHARGING' : 'IDLE'}
                  </span>
                }
              >
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Active Power</span>
                        <Zap size={14} style={{ color }} />
                      </div>
                      <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                        {station?.power_kw.toFixed(2)} <span className="text-xs font-normal text-slate-500">kW</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>Energy Today</span>
                        <Activity size={14} className="text-amber-600" />
                      </div>
                      <p className="text-2xl font-bold font-mono text-slate-900 mt-1">
                        {station?.energy_kwh.toFixed(2)} <span className="text-xs font-normal text-slate-500">kWh</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Voltage (AC)</p>
                      <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                        {station?.voltage} <span className="text-xs font-normal text-slate-500">V</span>
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Current Draw</p>
                      <p className="text-lg font-bold font-mono text-slate-800 mt-1">
                        {station?.current} <span className="text-xs font-normal text-slate-500">A</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <Wifi size={13} className="text-emerald-600" />
                      Protocol: HTTP / MQTT Stream
                    </span>
                    <span className="font-mono text-slate-400">Node ID: {station?.station_id}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Combined Live Sensor Output Chart */}
          <Card
            title="Real-Time Station Power Load"
            subtitle="Side-by-side power draw comparison for Station 1 and Station 2"
          >
            <div className="p-5 h-72">
              {history.length < 2 ? (
                <div className="flex items-center justify-center h-full text-xs text-slate-400">
                  Collecting live sensor points...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 8, right: 16, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={35} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} width={55} tickFormatter={v => `${v} kW`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="s1_power" stroke="#2563eb" strokeWidth={2} dot={false} name="Station 1" />
                    <Line type="monotone" dataKey="s2_power" stroke="#0891b2" strokeWidth={2} dot={false} name="Station 2" />
                    <Line type="monotone" dataKey="total" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Combined" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
