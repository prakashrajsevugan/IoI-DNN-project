import { useCallback } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { useFetch } from '../hooks/usePolling';
import { getHourlyAnalytics, getDailyAnalytics, getWeekdayAnalytics } from '../services/api';
import { LoadingSpinner, ErrorState, Card, PageHeader } from '../components/ui/SharedComponents';
import { Info } from 'lucide-react';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-2.5 text-xs shadow-md">
      <p className="text-slate-500 font-mono mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-semibold text-slate-900">{Number(p.value).toFixed(1)}</span>
        </div>
      ))}
    </div>
  );
};

const SAMPLE_INSIGHTS = [
  'Peak demand across the 2 stations occurs between 17:00 and 19:30.',
  'Station 1 handles approximately 54% of total daily delivered energy.',
  'Dual-station concurrent charging peaks remain comfortably under 7.4 kW capacity.',
  'Average charging session duration is 48 minutes per vehicle.',
];

export function AnalyticsPage() {
  const hourlyFetcher = useCallback(() => getHourlyAnalytics(), []);
  const dailyFetcher = useCallback(() => getDailyAnalytics(), []);
  const weekdayFetcher = useCallback(() => getWeekdayAnalytics(), []);

  const hourly = useFetch(hourlyFetcher);
  const daily = useFetch(dailyFetcher);
  const weekday = useFetch(weekdayFetcher);

  const anyLoading = (hourly.loading && !hourly.data) || (daily.loading && !daily.data);
  const anyError = hourly.error && daily.error;

  if (anyLoading) return <LoadingSpinner message="Loading historical trends..." />;
  if (anyError) return <ErrorState onRetry={hourly.refetch} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Historical Load Analytics"
        subtitle="Energy trends and concurrent usage profiles for the 2 charging stations"
      />

      {/* Daily energy consumption */}
      <Card title="Daily Energy Consumption (kWh)" titleRight={
        <span className="text-xs text-slate-500">Last 14 days</span>
      }>
        <div className="p-4 h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={daily.data ?? []} margin={{ top: 4, right: 12, left: 0, bottom: 0 }} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={46} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Bar dataKey="energy_kwh" name="Energy (kWh)" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Hourly demand + sessions row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Average Demand by Hour (kW)">
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourly.data ?? []} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={42} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="demand_kw" name="Demand (kW)" stroke="#0891b2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Charging Sessions per Hour">
          <div className="p-4 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly.data ?? []} barSize={14} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} interval={3} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="sessions" name="Sessions" fill="#16a34a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Weekday vs Weekend */}
      <Card title="Weekday vs Weekend Demand (Avg kW)" titleRight={
        <span className="text-xs text-slate-500">2-station comparison</span>
      }>
        <div className="p-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekday.data ?? []} barGap={4} barSize={16} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} width={42} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px', color: '#475569' }} />
              <Bar dataKey="weekday_avg" name="Weekday" fill="#2563eb" radius={[3, 3, 0, 0]} />
              <Bar dataKey="weekend_avg" name="Weekend" fill="#7c3aed" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Insights */}
      <Card title="Operational Insights">
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SAMPLE_INSIGHTS.map(insight => (
            <div key={insight} className="flex items-start gap-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
              <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">{insight}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
