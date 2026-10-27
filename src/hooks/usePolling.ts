import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Polls an async function at the given interval.
 * Returns { data, loading, error, refetch }.
 */
export function usePolling<T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  immediate = true,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetch = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (immediate) fetch();
    timerRef.current = setInterval(fetch, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetch, intervalMs, immediate]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Single-fire async fetch on mount.
 */
export function useFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => { run(); }, [run]);

  return { data, loading, error, refetch: run };
}

/** Returns elapsed seconds since a given ISO timestamp */
export function useElapsedSeconds(isoTimestamp: string | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isoTimestamp) return;
    const tick = () => {
      setElapsed(Math.round((Date.now() - new Date(isoTimestamp).getTime()) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isoTimestamp]);

  return elapsed;
}
