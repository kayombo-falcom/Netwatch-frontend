"use client";

import { useCallback, useEffect, useState } from "react";

// Also re-fetches on tab focus, since a backgrounded tab's timers get throttled and could go stale.
export function usePolledFetch<T>(url: string, pollIntervalMs: number, errorMessage: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error("request failed");
        const json: T = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) setError(errorMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, pollIntervalMs);

    const onVisible = () => {
      if (document.visibilityState === "visible") fetchData();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [url, pollIntervalMs, errorMessage, refreshToken]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRefreshToken(t => t + 1);
  }, []);

  return { data, loading, refreshing, error, refresh };
}
