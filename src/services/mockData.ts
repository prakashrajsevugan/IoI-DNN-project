import type {
  StationData,
  DemandPoint,
  ForecastPoint,
  ForecastSummary,
  ChargingSession,
  ModelMetrics,
  ModelComparisonPoint,
  KPISummary,
  DeviceStatus,
  HourlyData,
  DailyData,
  WeekdayData,
} from '../types';

// ── Utilities ──────────────────────────────────────────────────────────────
function isoNow(offsetMin = 0): string {
  return new Date(Date.now() + offsetMin * 60 * 1000).toISOString();
}

function formatHour(h: number): string {
  return h.toString().padStart(2, '0') + ':00';
}

/** Smooth random walk: bounded around a base value */
function walk(current: number, base: number, step = 0.5, min = 0, max = 30): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  const reversion = (base - current) * 0.08;
  return Math.min(max, Math.max(min, current + delta + reversion));
}

// ── Two Dedicated Charging Stations State ─────────────────────────────────
let _s1Voltage = 230.2;
let _s1Current = 15.6;
let _s1Energy = 14.80;
let _s1Charging = true;

let _s2Voltage = 229.8;
let _s2Current = 14.9;
let _s2Energy = 11.35;
let _s2Charging = true;

// ── Station Data (2 Stations) ─────────────────────────────────────────────
export function generateAllStationsData(): StationData[] {
  _s1Voltage = walk(_s1Voltage, 230, 0.4, 226, 234);
  _s1Current = _s1Charging ? walk(_s1Current, 15.6, 0.3, 12, 16.5) : 0;
  _s1Energy += _s1Charging ? 0.005 : 0;

  _s2Voltage = walk(_s2Voltage, 230, 0.4, 225, 234);
  _s2Current = _s2Charging ? walk(_s2Current, 14.8, 0.3, 12, 16.0) : 0;
  _s2Energy += _s2Charging ? 0.004 : 0;

  // Occasional random state changes
  if (Math.random() < 0.02) _s1Charging = !_s1Charging;
  if (Math.random() < 0.02) _s2Charging = !_s2Charging;

  return [
    {
      station_id: 'EV-STATION-01',
      voltage: +_s1Voltage.toFixed(1),
      current: +_s1Current.toFixed(1),
      power_kw: +(_s1Voltage * _s1Current / 1000).toFixed(2),
      energy_kwh: +_s1Energy.toFixed(2),
      charging: _s1Charging,
      timestamp: isoNow(),
    },
    {
      station_id: 'EV-STATION-02',
      voltage: +_s2Voltage.toFixed(1),
      current: +_s2Current.toFixed(1),
      power_kw: +(_s2Voltage * _s2Current / 1000).toFixed(2),
      energy_kwh: +_s2Energy.toFixed(2),
      charging: _s2Charging,
      timestamp: isoNow(),
    },
  ];
}

export function generateStationData(stationId = 'EV-STATION-01'): StationData {
  const stations = generateAllStationsData();
  return stations.find(s => s.station_id === stationId) || stations[0];
}

// ── KPI Summary for 2 Stations ────────────────────────────────────────────
export function generateKPISummary(): KPISummary {
  const stations = generateAllStationsData();
  const currentDemand = +(stations.reduce((acc, s) => acc + s.power_kw, 0)).toFixed(2);
  const activeCount = stations.filter(s => s.charging).length;
  const totalEnergy = +(stations.reduce((acc, s) => acc + s.energy_kwh, 0)).toFixed(1);

  return {
    current_demand_kw: currentDemand,
    current_demand_change_pct: +(Math.random() * 4 - 1.8).toFixed(1),
    active_sessions: activeCount,
    total_chargers: 2,
    today_energy_kwh: totalEnergy,
    peak_demand_kw: 7.2,
    peak_demand_time: '14:30',
    predicted_peak_kw: 7.4,
    predicted_peak_time: '18:15',
    forecast_accuracy_pct: 95.8,
    forecast_model: 'DNN/LSTM',
  };
}

// ── 24-hour demand profile for 2 AC Charging Stations (max ~7.4 kW) ──────
const BASE_PROFILE_2_STATIONS = [
  0.4, 0.4, 0.3, 0.3, 0.6, 1.2, 2.5, 4.8, 6.8, 6.4, 5.2, 4.6,
  4.9, 5.4, 6.2, 7.0, 7.2, 6.9, 6.4, 5.0, 3.6, 2.0, 1.0, 0.6,
];

export function generateDemandHistory(points = 288): DemandPoint[] {
  const now = Date.now();
  const interval = (24 * 60 * 60 * 1000) / points;
  const result: DemandPoint[] = [];
  let current = 5.2;

  for (let i = points; i >= 0; i--) {
    const ts = new Date(now - i * interval);
    const hour = ts.getHours();
    const base = BASE_PROFILE_2_STATIONS[hour];
    current = walk(current, base, 0.3, 0.2, 7.5);
    result.push({ timestamp: ts.toISOString(), demand_kw: +current.toFixed(2) });
  }

  // compute moving average (window=12)
  const window = 12;
  return result.map((pt, idx) => {
    const slice = result.slice(Math.max(0, idx - window), idx + 1);
    const avg = slice.reduce((s, p) => s + p.demand_kw, 0) / slice.length;
    return { ...pt, moving_avg: +avg.toFixed(2) };
  });
}

// ── Forecast data ─────────────────────────────────────────────────────────
export function generateForecastData(): ForecastPoint[] {
  const history = generateDemandHistory(96);
  const now = Date.now();
  const horizon = 24; // 24 future points (30-min each)
  const forecasts: ForecastPoint[] = [];

  let last = history[history.length - 1]?.demand_kw ?? 5.5;

  for (let i = 1; i <= horizon; i++) {
    const ts = new Date(now + i * 30 * 60 * 1000);
    const hour = ts.getHours();
    const base = BASE_PROFILE_2_STATIONS[hour];
    last = walk(last, base, 0.3, 0.2, 7.5);
    const uncertainty = 0.3 + (i / horizon) * 0.7;
    const val = last;

    forecasts.push({
      timestamp: ts.toISOString(),
      demand_kw: +val.toFixed(2),
      upper_bound: +(val + uncertainty).toFixed(2),
      lower_bound: +Math.max(0, val - uncertainty).toFixed(2),
      is_forecast: true,
    });
  }

  return [
    ...history.slice(-48).map(p => ({ ...p, is_forecast: false })),
    ...forecasts,
  ] as ForecastPoint[];
}

export function generateForecastSummary(): ForecastSummary {
  return {
    next_15m: 5.6,
    next_30m: 6.2,
    next_1h: 6.9,
    next_6h_peak: 7.3,
    expected_peak_time: '18:15',
    peak_risk: 'MEDIUM',
  };
}

// ── Charging Sessions (for 2 Stations) ────────────────────────────────────
const SESSION_STATUSES: ChargingSession['status'][] = ['Completed', 'Completed', 'Completed', 'Charging', 'Idle'];

function randomTime(hoursAgo: number): string {
  const d = new Date(Date.now() - hoursAgo * 3600000 - Math.random() * 3600000);
  return d.toISOString();
}

export function generateChargingSessions(count = 15): ChargingSession[] {
  return Array.from({ length: count }, (_, i) => {
    const status = i < 2 ? 'Charging' : SESSION_STATUSES[Math.floor(Math.random() * SESSION_STATUSES.length)];
    const start = randomTime(i * 1.5);
    const duration = status === 'Charging' ? null : Math.floor(40 + Math.random() * 70);
    const endTs = duration ? new Date(new Date(start).getTime() + duration * 60000).toISOString() : null;
    const station = i % 2 === 0 ? 'EV-STATION-01' : 'EV-STATION-02';
    return {
      session_id: `SES-${String(i + 1).padStart(3, '0')}`,
      station,
      start_time: start,
      end_time: endTs,
      duration_min: duration,
      energy_kwh: +(3.5 + Math.random() * 7.5).toFixed(2),
      peak_power_kw: +(3.2 + Math.random() * 0.5).toFixed(2),
      status,
    };
  });
}

// ── Model Metrics ──────────────────────────────────────────────────────────
export function getModelMetrics(): ModelMetrics[] {
  return [
    { model_name: 'DNN/LSTM', mae: 0.28, rmse: 0.42, mape: 4.8, r_squared: 0.96, status: 'Primary', color: '#2563eb' },
    { model_name: 'PatchTST', mae: 0.32, rmse: 0.46, mape: 5.4, r_squared: 0.95, status: 'Baseline', color: '#059669' },
    { model_name: 'TimesFM 2.5', mae: 0.25, rmse: 0.38, mape: 4.2, r_squared: 0.98, status: 'Best', color: '#7c3aed' },
  ];
}

// ── Model Comparison Chart Data ────────────────────────────────────────────
export function generateModelComparisonData(points = 48): ModelComparisonPoint[] {
  const now = Date.now();
  const interval = 30 * 60 * 1000;
  let actual = 5.2, dnn = 5.2, ptst = 5.2, tfm = 5.2;

  return Array.from({ length: points }, (_, i) => {
    const ts = new Date(now - (points - i) * interval);
    const hour = ts.getHours();
    const base = BASE_PROFILE_2_STATIONS[hour];

    actual = walk(actual, base, 0.35, 0.2, 7.5);
    dnn = walk(dnn, actual, 0.4, 0.2, 7.5);
    ptst = walk(ptst, actual, 0.45, 0.2, 7.5);
    tfm = walk(tfm, actual, 0.3, 0.2, 7.5);

    return {
      timestamp: ts.toISOString(),
      actual: +actual.toFixed(2),
      dnn_lstm: +dnn.toFixed(2),
      patchtst: +ptst.toFixed(2),
      timesfm: +tfm.toFixed(2),
    };
  });
}

// ── Hourly Analytics ───────────────────────────────────────────────────────
export function generateHourlyData(): HourlyData[] {
  return BASE_PROFILE_2_STATIONS.map((base, h) => ({
    hour: h,
    label: formatHour(h),
    demand_kw: +(base + (Math.random() - 0.5) * 0.4).toFixed(2),
    sessions: Math.min(2, Math.floor(base / 3.5) + (Math.random() > 0.5 ? 1 : 0)),
    energy_kwh: +(base * 0.95 + Math.random() * 0.5).toFixed(2),
  }));
}

// ── Daily Analytics ───────────────────────────────────────────────────────
export function generateDailyData(days = 14): DailyData[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - i - 1) * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      energy_kwh: +(28 + Math.random() * 12).toFixed(1),
      peak_kw: +(6.8 + Math.random() * 0.6).toFixed(2),
      sessions: Math.floor(4 + Math.random() * 6),
    };
  });
}

// ── Weekday vs Weekend ─────────────────────────────────────────────────────
export function generateWeekdayData(): WeekdayData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    weekday_avg: +(5.4 + Math.random() * 1.5).toFixed(2),
    weekend_avg: +(3.8 + Math.random() * 1.2).toFixed(2),
  }));
}

// ── Device Status ──────────────────────────────────────────────────────────
export function generateDeviceStatus(): DeviceStatus {
  return {
    device_id: 'ESP32-DUAL-GATEWAY',
    online: true,
    protocol: 'HTTP / MQTT',
    last_seen: isoNow(),
    firmware: '2.1.0-prod',
    signal_strength: 'Strong',
    sensors: { voltage: true, current: true, charging_status: true },
  };
}
