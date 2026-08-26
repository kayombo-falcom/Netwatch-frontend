"use client";

import { useEffect, useState } from "react";
import type { NetworkMeta } from "@/app/api/network/meta/route";

export const useNetworkMeta = () => {
  const [data, setData] = useState<NetworkMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/network/meta")
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

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading };
};
