"use client";

import type { NetworkScanResult } from "@/lib/network-types";
import { usePolledFetch } from "./use-polled-fetch";

// A scan actively pings every host on the subnet, so it's heavier than the
// other polled reads — poll far less often than link/AP stats.
const POLL_INTERVAL_MS = 45_000;

export const useNetworkDevices = () =>
  usePolledFetch<NetworkScanResult>("/api/network/devices", POLL_INTERVAL_MS, "Unable to scan the local network");
