"use client";

import { useCallback, useEffect, useState } from "react";
import type { NetworkMeta } from "@/app/api/network/meta/route";

// ISP/location change far less often than link stats, but still need to be
// re-checked periodically — switching to a different network mid-session
// (different Wi-Fi, a VPN, a hotspot) changes both.
const POLL_INTERVAL_MS = 60_000;

export const useNetworkMeta = () => {
  const [data, setData] = useState<NetworkMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchMeta = () => {
      fetch("/api/network/meta", { cache: "no-store" })
        .then(res => (res.ok ? res.json() : null))
        .then((json: NetworkMeta | null) => {
          if (!cancelled) setData(json);
        })
        .catch(() => {
          if (!cancelled) setData(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    fetchMeta();
    const interval = setInterval(fetchMeta, POLL_INTERVAL_MS);

    // Background tabs get their timers throttled by the browser, so a
    // network switch made while this tab wasn't focused could otherwise sit
    // stale well past POLL_INTERVAL_MS — re-check the moment it's visible again.
    const onVisible = () => {
      if (document.visibilityState === "visible") fetchMeta();
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

  const refresh = useCallback(() => setRefreshToken(t => t + 1), []);

  return { data, loading, refresh };
};
