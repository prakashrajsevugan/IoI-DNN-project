import { useState, useCallback, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFetch } from '../hooks/usePolling';
import { getChargingSessions } from '../services/api';
import { LoadingSpinner, ErrorState, PageHeader, Badge, EmptyState } from '../components/ui/SharedComponents';
import { formatDateTime, formatDuration } from '../utils/format';
import type { ChargingSession } from '../types';

type Filter = 'All' | ChargingSession['status'];
type SortKey = keyof ChargingSession;

const PAGE_SIZE = 10;

export function SessionsPage() {
  const fetcher = useCallback(() => getChargingSessions(), []);
  const { data, loading, error, refetch } = useFetch(fetcher);

  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('start_time');
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(1);

  const [stationFilter, setStationFilter] = useState<'All' | 'EV-STATION-01' | 'EV-STATION-02'>('All');

  const filtered = useMemo(() => {
    if (!data) return [];
    return data
      .filter(s => filter === 'All' || s.status === filter)
      .filter(s => stationFilter === 'All' || s.station === stationFilter)
      .filter(s =>
        s.session_id.toLowerCase().includes(search.toLowerCase()) ||
        s.station.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const va = a[sortKey] ?? '';
        const vb = b[sortKey] ?? '';
        const cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return sortAsc ? cmp : -cmp;
      });
  }, [data, filter, stationFilter, search, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc(a => !a);
    else { setSortKey(key); setSortAsc(true); }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col
      ? sortAsc ? <ChevronUp size={13} className="text-blue-600" /> : <ChevronDown size={13} className="text-blue-600" />
      : <ChevronDown size={13} className="text-slate-400 opacity-0 group-hover:opacity-100" />;

  const statusVariant = (s: ChargingSession['status']) =>
    s === 'Charging' ? 'green' : s === 'Completed' ? 'blue' : 'gray';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Charging Sessions"
        subtitle="Historical and live charging logs for Station 1 & Station 2"
        right={
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {(['All', 'EV-STATION-01', 'EV-STATION-02'] as const).map(st => (
              <button
                key={st}
                onClick={() => { setStationFilter(st); setPage(1); }}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  stationFilter === st
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'All' ? 'All Stations' : st === 'EV-STATION-01' ? 'Station 1' : 'Station 2'}
              </button>
            ))}
          </div>
        }
      />

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by session ID…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors shadow-xs"
          />
        </div>
        <div className="flex gap-1.5">
          {(['All', 'Charging', 'Completed', 'Idle'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white border-transparent shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
        {loading && !data && <LoadingSpinner message="Loading sessions..." />}
        {error && !data && <ErrorState onRetry={refetch} />}

        {data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  {[
                    { key: 'session_id', label: 'Session ID' },
                    { key: 'station', label: 'Station' },
                    { key: 'start_time', label: 'Start Time' },
                    { key: 'end_time', label: 'End Time' },
                    { key: 'duration_min', label: 'Duration' },
                    { key: 'energy_kwh', label: 'Energy' },
                    { key: 'peak_power_kw', label: 'Peak Power' },
                    { key: 'status', label: 'Status' },
                  ].map(col => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key as SortKey)}
                      className="group text-left px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        <SortIcon col={col.key as SortKey} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.length === 0 && (
                  <tr><td colSpan={8}><EmptyState message="No sessions match your filters." /></td></tr>
                )}
                {paged.map(s => (
                  <tr key={s.session_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-blue-600">{s.session_id}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-700">{s.station}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{formatDateTime(s.start_time)}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-600">{s.end_time ? formatDateTime(s.end_time) : '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-700">{formatDuration(s.duration_min)}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold tabular-nums text-slate-900">{s.energy_kwh.toFixed(2)} kWh</td>
                    <td className="px-4 py-3.5 text-xs tabular-nums text-slate-700">{s.peak_power_kw.toFixed(1)} kW</td>
                    <td className="px-4 py-3.5">
                      <Badge label={s.status} variant={statusVariant(s.status)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)]">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                      page === p
                        ? 'bg-[var(--accent-blue)] text-white'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-active)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
