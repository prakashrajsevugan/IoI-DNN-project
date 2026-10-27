import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { StatusDot } from '../components/ui/SharedComponents';

function useNow() {
  const [now] = useState(() => new Date());
  return now.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const now = useNow();

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-800">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Topbar in crisp white */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200/80 bg-white shrink-0 z-20">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
                EV Charging Demand Prediction
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">IoT Sensor Telemetry & AI Forecasting</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100/70 border border-slate-200/60 text-xs text-slate-600 font-mono tabular-nums">
              {now}
            </span>
            <div className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200/60">
              <StatusDot online label="Live Stream" size="sm" />
            </div>
            <button className="relative p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Main scrollable view */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
