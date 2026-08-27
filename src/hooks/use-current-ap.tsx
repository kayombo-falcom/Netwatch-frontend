"use client";

import { useCallback, useEffect, useState } from "react";
import type { CurrentConnection } from "@/lib/wifi";

const POLL_INTERVAL_MS = 10_000;

export const useCurrentAp = () => {
  const [data, setData] = useState<CurrentConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/wifi/current", { cache: "no-store" });
        if (!res.ok) throw new Error("request failed");
        const json: CurrentConnection = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to read network status on this host");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);

    // Background tabs get their timers throttled by the browser, so a
    // network switch made while this tab wasn't focused could otherwise sit
    // stale well past POLL_INTERVAL_MS — re-check the moment it's visible again.
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchStatus();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [refreshToken]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    setRefreshToken(t => t + 1);
  }, []);

  return { data, loading, refreshing, error, refresh };
};
