import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { getDeviceStatus } from '../services/api';
import { LoadingSpinner, ErrorState, PageHeader, Card } from '../components/ui/SharedComponents';
import { formatSecondsAgo } from '../utils/format';
import { useElapsedSeconds } from '../hooks/usePolling';
import { Cpu, Wifi, Radio, Shield, CheckCircle2, XCircle } from 'lucide-react';

export function DevicePage() {
  const fetcher = useCallback(() => getDeviceStatus(), []);
  const { data, loading, error, refetch } = usePolling(fetcher, 5000);
  const elapsed = useElapsedSeconds(data?.last_seen ?? null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="IoT Device & Gateway Diagnostics"
        subtitle="ESP32 Wokwi simulation status monitoring the 2 charging stations"
      />

      {loading && !data && <LoadingSpinner message="Connecting to device gateway..." />}
      {error && !data && <ErrorState message="DEVICE OFFLINE — Cannot reach ESP32 gateway." onRetry={refetch} />}

      {data && (
        <>
          {/* Device identity */}
          <Card title="Gateway Information">
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[
                { icon: Cpu, label: 'Device ID', value: data.device_id, mono: true, color: '#2563eb' },
                { icon: Wifi, label: 'Connection', value: data.online ? 'ONLINE' : 'OFFLINE', mono: false, color: data.online ? '#16a34a' : '#dc2626' },
                { icon: Radio, label: 'Protocol', value: data.protocol, mono: true, color: '#7c3aed' },
                { icon: Shield, label: 'Firmware', value: data.firmware, mono: true, color: '#0891b2' },
                { icon: Wifi, label: 'Signal Strength', value: data.signal_strength, mono: false, color: '#d97706' },
                { icon: Cpu, label: 'Last Telemetry', value: formatSecondsAgo(elapsed), mono: false, color: '#64748b' },
              ].map(({ icon: Icon, label, value, mono, color }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Icon size={13} />
                    <p className="text-[10px] uppercase font-semibold tracking-wider">{label}</p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${mono ? 'font-mono' : ''}`}
                    style={{ color }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* Sensor status */}
          <Card title="Dual-Station Sensor Channels">
            <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Voltage Sensors (Station 1 & 2)', key: 'voltage', desc: 'Dual INA219 line voltage monitoring' },
                { label: 'Current Sensors (Station 1 & 2)', key: 'current', desc: 'Dual ACS712 current transformers' },
                { label: 'Relay & Pilot Status', key: 'charging_status', desc: 'Digital GPIO charging interlocks' },
              ].map(({ label, key, desc }) => {
                const ok = data.sensors[key as keyof typeof data.sensors];
                return (
                  <div key={key} className={`p-4 rounded-xl border ${ok ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      {ok
                        ? <CheckCircle2 size={16} className="text-emerald-600" />
                        : <XCircle size={16} className="text-rose-600" />
                      }
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                    </div>
                    <p className={`text-xs font-semibold mb-1 ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {ok ? 'Active & Calibrated' : 'Signal Fault'}
                    </p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* System Dataflow */}
          <Card title="System Dataflow Pipeline">
            <div className="p-5">
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Wokwi ESP32 IoT Simulation', sub: 'Dual AC charging station microcontrollers' },
                  { label: 'Current & Voltage Telemetry', sub: 'Per-second sensor sampling' },
                  { label: 'JSON Stream over HTTP / MQTT', sub: 'Secure transport layer' },
                  { label: 'Inference Engine', sub: 'DNN/LSTM, PatchTST, and TimesFM models' },
                  { label: 'EV Demand Dashboard', sub: 'Real-time telemetry and predictive control' },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-start gap-3">
                    <div className="flex flex-col items-center gap-0">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-700 shrink-0">
                        {i + 1}
                      </div>
                      {i < arr.length - 1 && <div className="w-px h-6 bg-slate-200 mt-0.5" />}
                    </div>
                    <div className="pb-1">
                      <p className="text-sm font-semibold text-slate-900">{step.label}</p>
                      <p className="text-xs text-slate-500">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
