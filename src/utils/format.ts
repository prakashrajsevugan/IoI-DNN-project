/** Format an ISO timestamp to a short readable time */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format an ISO timestamp to date + time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format a date only */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Format duration in minutes to "Xh Ym" or "Ym" */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Returns seconds-ago string */
export function formatSecondsAgo(seconds: number): string {
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  return `${Math.floor(seconds / 3600)} hours ago`;
}

/** Clamp a number to [min, max] */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

/** Format kW values */
export function formatKW(val: number): string {
  return val.toFixed(1);
}

/** Format kWh values */
export function formatKWh(val: number): string {
  return val.toFixed(2);
}
