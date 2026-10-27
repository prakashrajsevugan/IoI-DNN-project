import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, TrendingUp, Zap, BarChart3,
  FlaskConical, Cpu, Settings, X, Zap as LogoIcon,
} from 'lucide-react';
import { SectionLabel, StatusDot } from '../components/ui/SharedComponents';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/monitoring', label: 'Live Monitoring', icon: Activity },
  { to: '/forecast', label: 'Demand Forecast', icon: TrendingUp },
  { to: '/sessions', label: 'Charging Sessions', icon: Zap },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/models', label: 'Model Comparison', icon: FlaskConical },
];

const SYSTEM_ITEMS = [
  { to: '/device', label: 'IoT Device', icon: Cpu },
  { to: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function NavItem({ to, label, Icon, onClick }: {
  to: string; label: string; Icon: any; onClick?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-50 text-blue-600 font-semibold border border-blue-100/80'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 min-w-[16rem] shrink-0 flex flex-col
          bg-white border-r border-slate-200/80
          transition-transform duration-200 ease-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0 animate-slide-in' : '-translate-x-full'}
        `}
      >
        {/* Logo area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <LogoIcon size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-tight leading-none">EV Forecast</p>
              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-none">Dual Station AI Demand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2-Station Status Badge */}
        <div className="mx-4 mt-4 mb-2 flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200/60">
          <div className="flex items-center gap-2">
            <StatusDot online size="sm" />
            <span className="text-xs text-emerald-700 font-semibold">2 Stations Online</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-mono font-medium">ESP32</span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <SectionLabel>Navigation</SectionLabel>
          <div className="space-y-0.5 mb-5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavItem key={to} to={to} label={label} Icon={Icon} onClick={onClose} />
            ))}
          </div>

          <SectionLabel>System</SectionLabel>
          <div className="space-y-0.5">
            {SYSTEM_ITEMS.map(({ to, label, icon: Icon }) => (
              <NavItem key={to} to={to} label={label} Icon={Icon} onClick={onClose} />
            ))}
          </div>
        </nav>

        {/* Clean minimal footer without student project text */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 shrink-0">
          <div className="p-3 rounded-lg bg-white border border-slate-200/60 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Dual Station Setup</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-1.5 py-0.5 rounded">v2.1</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Station 1 & Station 2 telemetry paired with DNN/LSTM forecast.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
