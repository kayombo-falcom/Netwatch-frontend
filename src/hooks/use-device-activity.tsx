"use client";

import { useEffect, useState } from "react";
import type { DeviceActivity } from "@/lib/devices-types";

export type DeviceActivityState =
  | { status: "loading" }
  | { status: "loaded"; entries: DeviceActivity[] }
  | { status: "error"; message: string };

/**
 * Fetches a device's recent activity feed for `mac`. Unlike the
 * hostname/OS-detection lookups this isn't gated behind a manual trigger —
 * it's a cheap DB read, not a multi-second live probe, so it loads as soon
 * as the device drawer mounts.
 */
export function useDeviceActivity(mac: string): DeviceActivityState {
  const [state, setState] = useState<DeviceActivityState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/devices/${encodeURIComponent(mac)}/activity`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then((entries: DeviceActivity[]) => {
        if (!cancelled) setState({ status: "loaded", entries });
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
