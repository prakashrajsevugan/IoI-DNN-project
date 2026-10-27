import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

interface LoadingProps {
  message?: string;
}
export function LoadingSpinner({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <Loader2 size={26} className="animate-spin text-blue-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}
export function ErrorState({ message = 'Unable to connect to IoT backend.', onRetry }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-slate-600">
      <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-lg border border-amber-200">
        <AlertTriangle size={16} />
        <span className="font-semibold text-sm">Connection Issue</span>
      </div>
      <p className="text-sm text-center max-w-xs text-slate-500">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={13} />
          Retry Connection
        </button>
      )}
    </div>
  );
}

interface EmptyProps {
  message?: string;
}
export function EmptyState({ message = 'No data available.' }: EmptyProps) {
  return (
    <div className="flex items-center justify-center py-14 text-slate-400 text-sm font-medium">
      {message}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  titleRight?: ReactNode;
}
export function Card({ children, className = '', title, subtitle, titleRight }: CardProps) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden ${className}`}
    >
      {title && (
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {titleRight && <div>{titleRight}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface BadgeProps {
  label: string;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gray';
}
const BADGE_STYLES: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  red: 'bg-rose-50 text-rose-700 border-rose-200/80',
  blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/80',
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
};
export function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${BADGE_STYLES[variant]}`}>
      {label}
    </span>
  );
}

interface StatusDotProps {
  online: boolean;
  label?: string;
  size?: 'sm' | 'md';
}
export function StatusDot({ online, label, size = 'md' }: StatusDotProps) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';
  return (
    <div className="flex items-center gap-2">
      <span className={`${dotSize} rounded-full animate-pulse-dot ${online ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      {label && (
        <span className={`text-xs font-semibold ${online ? 'text-emerald-700' : 'text-rose-700'}`}>
          {label}
        </span>
      )}
    </div>
  );
}

interface MockBannerProps {
  text?: string;
}
export function MockDataBanner({ text = 'Wokwi ESP32 Stream Active' }: MockBannerProps) {
  return (
    <div className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
      <span>{text}</span>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}
export function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right && <div className="flex items-center gap-2.5 shrink-0">{right}</div>}
    </div>
  );
}

interface SectionLabelProps {
  children: ReactNode;
}
export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold px-3 mb-1.5">
      {children}
    </p>
  );
}
