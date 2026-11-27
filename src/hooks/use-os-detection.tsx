"use client";

import { useCallback, useState } from "react";
import type { OsDetectionResult } from "@/lib/network-types";

export type OsDetectionState = { status: "loading" } | OsDetectionResult;

// A multi-second nmap scan, so callers trigger it per device rather than for the whole list at once.
// Keyed by MAC, not IP, since DHCP can reassign an IP and an IP-keyed cache would show a stale result.
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
