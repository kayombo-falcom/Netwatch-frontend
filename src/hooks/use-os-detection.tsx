"use client";

import { useCallback, useState } from "react";
import type { OsDetectionResult } from "@/lib/os-fingerprint";

export type OsDetectionState = { status: "loading" } | OsDetectionResult;

/**
 * Runs the standalone active OS-fingerprint mechanism (`/api/network/os-detect`)
 * on demand, per IP — it's a multi-second nmap scan, so callers trigger it
 * per device rather than for the whole discovered list at once. Keeps its own
 * per-IP result cache, independent of the (cheap, TTL-guess) discovery scan.
 */
export const useOsDetection = () => {
  const [results, setResults] = useState<Record<string, OsDetectionState>>({});

  const detect = useCallback((ip: string) => {
    setResults(prev => ({ ...prev, [ip]: { status: "loading" } }));
    fetch(`/api/network/os-detect?ip=${encodeURIComponent(ip)}`, { cache: "no-store" })
      .then(res => res.json())
      .then((json: OsDetectionResult) => setResults(prev => ({ ...prev, [ip]: json })))
      .catch(() => setResults(prev => ({ ...prev, [ip]: { status: "engine_unavailable", reason: "Request failed" } })));
  }, []);

  return { results, detect };
};
