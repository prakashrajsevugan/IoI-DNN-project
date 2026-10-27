// Core IoT / Station Types
export interface StationData {
  station_id: string;
  voltage: number;
  current: number;
  power_kw: number;
  energy_kwh: number;
  charging: boolean;
  timestamp: string;
}

// Demand time-series point
export interface DemandPoint {
  timestamp: string;
  demand_kw: number;
  moving_avg?: number;
}

// Forecast prediction point
export interface ForecastPoint {
  timestamp: string;
  demand_kw: number;
  upper_bound?: number;
  lower_bound?: number;
  is_forecast?: boolean;
}

// Forecast response
export interface ForecastResponse {
  model: string;
  horizon: string;
  predictions: ForecastPoint[];
  generated_at: string;
}

// Forecast summary cards
export interface ForecastSummary {
  next_15m: number;
  next_30m: number;
  next_1h: number;
  next_6h_peak: number;
  expected_peak_time: string;
  peak_risk: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Charging session
export interface ChargingSession {
  session_id: string;
  station: string;
  start_time: string;
  end_time: string | null;
  duration_min: number | null;
  energy_kwh: number;
  peak_power_kw: number;
  status: 'Completed' | 'Charging' | 'Idle';
}

// Model metrics
export interface ModelMetrics {
  model_name: string;
  mae: number;
  rmse: number;
  mape: number;
  r_squared: number;
  status: 'Primary' | 'Baseline' | 'Best' | 'Experimental';
  color: string;
}

// Model comparison data point
export interface ModelComparisonPoint {
  timestamp: string;
  actual?: number;
  dnn_lstm?: number;
  patchtst?: number;
  timesfm?: number;
}

// KPI summary
export interface KPISummary {
  current_demand_kw: number;
  current_demand_change_pct: number;
  active_sessions: number;
  total_chargers: number;
  today_energy_kwh: number;
  peak_demand_kw: number;
  peak_demand_time: string;
  predicted_peak_kw: number;
  predicted_peak_time: string;
  forecast_accuracy_pct: number;
  forecast_model: string;
}

// Device status
export interface DeviceStatus {
  device_id: string;
  online: boolean;
  protocol: string;
  last_seen: string;
  firmware: string;
  signal_strength: 'Weak' | 'Fair' | 'Good' | 'Strong';
  sensors: {
    voltage: boolean;
    current: boolean;
    charging_status: boolean;
  };
}

// Analytics data
export interface HourlyData {
  hour: number;
  label: string;
  demand_kw: number;
  sessions: number;
  energy_kwh: number;
}

export interface DailyData {
  date: string;
  energy_kwh: number;
  peak_kw: number;
  sessions: number;
}

export interface WeekdayData {
  day: string;
  weekday_avg: number;
  weekend_avg: number;
}

// Settings
export interface AppSettings {
  station_capacity_kw: number;
  forecast_horizon: string;
  refresh_interval_sec: number;
  alert_threshold_pct: number;
  theme: 'light' | 'dark';
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}
