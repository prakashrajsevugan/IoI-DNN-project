/**
 * Centralized API service.
 *
 * When the real backend is ready, set VITE_API_URL in your .env file:
 *   VITE_API_URL=http://localhost:8000
 *
 * Then replace each function's mock implementation with the real fetch call.
 * The function signatures and return types must NOT change.
 */
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
  ApiResponse,
} from '../types';

import {
  generateStationData,
  generateAllStationsData,
  generateKPISummary,
  generateDemandHistory,
  generateForecastData,
  generateForecastSummary,
  generateChargingSessions,
  getModelMetrics,
  generateModelComparisonData,
  generateHourlyData,
  generateDailyData,
  generateWeekdayData,
  generateDeviceStatus,
} from './mockData';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK = true; // flip to false when real backend is ready

// ── Generic fetch helper ───────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ── Public API functions ───────────────────────────────────────────────────

/** GET /api/stations */
export async function getAllStationsData(): Promise<StationData[]> {
  if (USE_MOCK) return generateAllStationsData();
  const r = await apiFetch<StationData[]>('/api/stations');
  return r.data;
}

/** GET /api/station/current */
export async function getCurrentStationData(stationId?: string): Promise<StationData> {
  if (USE_MOCK) return generateStationData(stationId);
  const r = await apiFetch<StationData>(`/api/station/current${stationId ? `?station_id=${stationId}` : ''}`);
  return r.data;
}

/** GET /api/demand/kpi */
export async function getKPISummary(): Promise<KPISummary> {
  if (USE_MOCK) return generateKPISummary();
  const r = await apiFetch<KPISummary>('/api/demand/kpi');
  return r.data;
}

/** GET /api/demand/history?range=24h */
export async function getDemandHistory(range = '24h'): Promise<DemandPoint[]> {
  if (USE_MOCK) {
    const pointsMap: Record<string, number> = {
      '1h': 12, '6h': 72, '12h': 144, '24h': 288, '7d': 336,
    };
    return generateDemandHistory(pointsMap[range] ?? 288);
  }
  const r = await apiFetch<DemandPoint[]>(`/api/demand/history?range=${range}`);
  return r.data;
}

/** GET /api/demand/forecast */
export async function getForecast(): Promise<ForecastPoint[]> {
  if (USE_MOCK) return generateForecastData();
  const r = await apiFetch<ForecastPoint[]>('/api/demand/forecast');
  return r.data;
}

/** GET /api/demand/forecast-summary */
export async function getForecastSummary(): Promise<ForecastSummary> {
  if (USE_MOCK) return generateForecastSummary();
  const r = await apiFetch<ForecastSummary>('/api/demand/forecast-summary');
  return r.data;
}

/** GET /api/sessions */
export async function getChargingSessions(): Promise<ChargingSession[]> {
  if (USE_MOCK) return generateChargingSessions();
  const r = await apiFetch<ChargingSession[]>('/api/sessions');
  return r.data;
}

/** GET /api/models/comparison */
export async function getModelComparison(): Promise<ModelMetrics[]> {
  if (USE_MOCK) return getModelMetrics();
  const r = await apiFetch<ModelMetrics[]>('/api/models/comparison');
  return r.data;
}

/** GET /api/models/comparison-chart */
export async function getModelComparisonChart(): Promise<ModelComparisonPoint[]> {
  if (USE_MOCK) return generateModelComparisonData();
  const r = await apiFetch<ModelComparisonPoint[]>('/api/models/comparison-chart');
  return r.data;
}

/** GET /api/device/status */
export async function getDeviceStatus(): Promise<DeviceStatus> {
  if (USE_MOCK) return generateDeviceStatus();
  const r = await apiFetch<DeviceStatus>('/api/device/status');
  return r.data;
}

/** GET /api/analytics/hourly */
export async function getHourlyAnalytics(): Promise<HourlyData[]> {
  if (USE_MOCK) return generateHourlyData();
  const r = await apiFetch<HourlyData[]>('/api/analytics/hourly');
  return r.data;
}

/** GET /api/analytics/daily */
export async function getDailyAnalytics(): Promise<DailyData[]> {
  if (USE_MOCK) return generateDailyData();
  const r = await apiFetch<DailyData[]>('/api/analytics/daily');
  return r.data;
}

/** GET /api/analytics/weekday */
export async function getWeekdayAnalytics(): Promise<WeekdayData[]> {
  if (USE_MOCK) return generateWeekdayData();
  const r = await apiFetch<WeekdayData[]>('/api/analytics/weekday');
  return r.data;
}
