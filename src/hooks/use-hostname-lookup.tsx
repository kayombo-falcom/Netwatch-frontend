"use client";

import { useCallback, useState } from "react";
import type { HostnameLookupResult } from "@/lib/network-types";

export type HostnameLookupState = { status: "loading" } | HostnameLookupResult;

/**
 * Runs the on-demand hostname lookup (`/api/network/hostname`) per device.
 * Keyed by MAC, not IP — DHCP can reassign an IP to a different device
 * later, and an IP-keyed cache would show that device the old one's name.
 */
export const useHostnameLookup = () => {
  const [results, setResults] = useState<Record<string, HostnameLookupState>>({});

  const lookup = useCallback((ip: string, mac: string) => {
    setResults(prev => ({ ...prev, [mac]: { status: "loading" } }));
    fetch(`/api/network/hostname?ip=${encodeURIComponent(ip)}`, { cache: "no-store" })
      .then(res => res.json())
      .then((json: HostnameLookupResult) => setResults(prev => ({ ...prev, [mac]: json })))
      .catch(() => setResults(prev => ({ ...prev, [mac]: { status: "not_found" } })));
  }, []);

  return { results, lookup };
};
