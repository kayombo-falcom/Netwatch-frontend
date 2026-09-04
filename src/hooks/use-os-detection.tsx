"use client";

import { useCallback, useState } from "react";
import type { OsDetectionResult } from "@/lib/network-types";

export type OsDetectionState = { status: "loading" } | OsDetectionResult;

/**
 * Runs the standalone active OS-fingerprint mechanism (`/api/network/os-detect`)
 * on demand — it's a multi-second nmap scan, so callers trigger it per device
 * rather than for the whole discovered list at once. Keeps its own result
 * cache, independent of the (cheap, TTL-guess) discovery scan.
 *
 * Keyed by MAC, not IP: DHCP can hand a device's old IP to a different
 * device later in the same session, and an IP-keyed cache would silently
 * hand that new device the previous one's stale result.
 */
export const useOsDetection = () => {
  const [results, setResults] = useState<Record<string, OsDetectionState>>({});

  const detect = useCallback((ip: string, mac: string) => {
    setResults(prev => ({ ...prev, [mac]: { status: "loading" } }));
    fetch(`/api/network/os-detect?ip=${encodeURIComponent(ip)}&mac=${encodeURIComponent(mac)}`, { cache: "no-store" })
      .then(res => res.json())
      .then((json: OsDetectionResult) => setResults(prev => ({ ...prev, [mac]: json })))
      .catch(() => setResults(prev => ({ ...prev, [mac]: { status: "engine_unavailable", reason: "Request failed" } })));
  }, []);

  return { results, detect };
};
