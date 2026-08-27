"use client";

import { useCallback, useState } from "react";
import type { HostnameLookupResult } from "@/lib/hostname-resolve";

export type HostnameLookupState = { status: "loading" } | HostnameLookupResult;

/**
 * Runs the on-demand hostname lookup (`/api/network/hostname`) per IP — a
 * multi-second DNS/NetBIOS/mDNS chain, so callers trigger it per device
 * rather than for the whole discovered list at once. Keeps its own per-IP
 * result cache, independent of the (fast, name-free) discovery scan.
 */
export const useHostnameLookup = () => {
  const [results, setResults] = useState<Record<string, HostnameLookupState>>({});

  const lookup = useCallback((ip: string) => {
    setResults(prev => ({ ...prev, [ip]: { status: "loading" } }));
    fetch(`/api/network/hostname?ip=${encodeURIComponent(ip)}`, { cache: "no-store" })
      .then(res => res.json())
      .then((json: HostnameLookupResult) => setResults(prev => ({ ...prev, [ip]: json })))
      .catch(() => setResults(prev => ({ ...prev, [ip]: { status: "not_found" } })));
  }, []);

  return { results, lookup };
};
