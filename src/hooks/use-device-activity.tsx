"use client";

import { useEffect, useState } from "react";
import type { DeviceActivity } from "@/lib/devices-types";

export type DeviceActivityState =
  | { status: "loading" }
  | { status: "loaded"; entries: DeviceActivity[] }
  | { status: "not-detected" }
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
        // The backend 404s for a MAC it's never persisted (no detection run yet) —
        // that's an expected state, not a failure.
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
