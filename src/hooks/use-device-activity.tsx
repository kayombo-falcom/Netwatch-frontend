"use client";

import { useEffect, useState } from "react";
import type { DeviceActivity } from "@/lib/devices-types";

export type DeviceActivityState =
  | { status: "loading" }
  | { status: "loaded"; entries: DeviceActivity[] }
  | { status: "not-detected" }
  | { status: "error"; message: string };

// Loads automatically on mount, unlike hostname/OS lookups, since it's a cheap DB read not a live probe.
export function useDeviceActivity(mac: string): DeviceActivityState {
  const [state, setState] = useState<DeviceActivityState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/devices/${encodeURIComponent(mac)}/activity`, { cache: "no-store" })
      .then(res => {
        // A 404 means no detection has run yet for this MAC — expected, not a failure.
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((entries: DeviceActivity[] | null) => {
        if (cancelled) return;
        if (entries === null) setState({ status: "not-detected" });
        else setState({ status: "loaded", entries });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error", message: "Unable to load activity" });
      });

    return () => {
      cancelled = true;
    };
  }, [mac]);

  return state;
}
