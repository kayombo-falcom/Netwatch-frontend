"use client";

import { useEffect, useState } from "react";
import type { CurrentWifi } from "@/lib/wifi";

const POLL_INTERVAL_MS = 10_000;

export const useCurrentAp = () => {
  const [data, setData] = useState<CurrentWifi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/wifi/current");
        if (!res.ok) throw new Error("request failed");
        const json: CurrentWifi = await res.json();
        if (!cancelled) {
          setData(json);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("Unable to read Wi-Fi status on this host");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { data, loading, error };
};
