import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';

const STORAGE_KEY = 'ev_forecast_settings';

const DEFAULT_SETTINGS: AppSettings = {
  station_capacity_kw: 7.4,
  forecast_horizon: '1h',
  refresh_interval_sec: 3,
  alert_threshold_pct: 90,
  theme: 'light',
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting };
}
