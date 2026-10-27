import { useSettings } from '../hooks/useSettings';
import { PageHeader, Card } from '../components/ui/SharedComponents';
import { Check } from 'lucide-react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}
function SliderField({ label, value, min, max, step, unit, onChange }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        <span className="text-sm font-mono font-bold text-blue-600">{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-blue-600"
      />
      <div className="flex justify-between text-xs text-slate-400">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  description?: string;
}
function SelectField({ label, value, options, onChange, description }: SelectFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      {description && <p className="text-xs text-slate-500">{description}</p>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:outline-none transition-colors shadow-xs"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

export function SettingsPage() {
  const { settings, updateSetting } = useSettings();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="System Settings"
        subtitle="Configure 2-station operational limits and telemetry frequencies"
      />

      <Card title="Station Load Configuration">
        <div className="p-5 space-y-6">
          <SliderField
            label="Total Combined Capacity (2 Stations)"
            value={settings.station_capacity_kw || 7.4}
            min={3.7} max={22} step={0.5} unit="kW"
            onChange={v => updateSetting('station_capacity_kw', v)}
          />
          <SliderField
            label="Peak Demand Alert Threshold"
            value={settings.alert_threshold_pct}
            min={50} max={100} step={5} unit="%"
            onChange={v => updateSetting('alert_threshold_pct', v)}
          />
        </div>
      </Card>

      <Card title="Forecasting Horizon">
        <div className="p-5 space-y-6">
          <SelectField
            label="Default Forecast Window"
            value={settings.forecast_horizon}
            options={['15m', '30m', '1h', '6h', '24h']}
            onChange={v => updateSetting('forecast_horizon', v)}
            description="Default prediction resolution shown on the forecast dashboard"
          />
        </div>
      </Card>

      <Card title="Telemetry Refresh Frequency">
        <div className="p-5 space-y-4">
          <SliderField
            label="Live Sensor Polling Rate"
            value={settings.refresh_interval_sec}
            min={1} max={10} step={1} unit="sec"
            onChange={v => updateSetting('refresh_interval_sec', v)}
          />
          <p className="text-xs text-slate-500">
            Controls how frequently ESP32 sensor telemetry is polled.
          </p>
        </div>
      </Card>

      <Card title="Theme & Appearance">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Current Theme</p>
              <p className="text-xs text-slate-500 mt-0.5">Professional engineering light theme active</p>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
              Professional Light
            </div>
          </div>
        </div>
      </Card>

      {/* Backend connection info */}
      <Card title="Live Backend Integration">
        <div className="p-5 space-y-3">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 space-y-1">
            <p className="text-slate-400"># Connect live backend in .env:</p>
            <p><span className="text-emerald-700 font-semibold">VITE_API_URL</span>=http://localhost:8000</p>
          </div>
          <p className="text-xs text-slate-500">
            Set <code className="text-blue-600 font-semibold">USE_MOCK = false</code> in <code className="text-blue-600 font-semibold">src/services/api.ts</code> to switch to live ESP32 MQTT/HTTP streams.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 font-medium">
          <Check size={14} />
          <span>All configurations saved automatically</span>
        </div>
      </div>
    </div>
  );
}
