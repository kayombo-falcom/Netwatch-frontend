"use client";

import { useCallback, useState } from "react";
import type { HostnameLookupResult } from "@/lib/network-types";

export type HostnameLookupState = { status: "loading" } | HostnameLookupResult;

// Keyed by MAC, not IP, since DHCP can reassign an IP and an IP-keyed cache would show the wrong name.
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
