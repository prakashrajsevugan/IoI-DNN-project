import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { MonitoringPage } from './pages/MonitoringPage';
import { ForecastPage } from './pages/ForecastPage';
import { SessionsPage } from './pages/SessionsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelsPage } from './pages/ModelsPage';
import { DevicePage } from './pages/DevicePage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="monitoring" element={<MonitoringPage />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="models" element={<ModelsPage />} />
          <Route path="device" element={<DevicePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
