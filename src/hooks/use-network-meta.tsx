"use client";

import type { NetworkMeta } from "@/lib/network-types";
import { usePolledFetch } from "./use-polled-fetch";

// ISP/location change far less often than link stats, but still need to be
// re-checked periodically — switching to a different network mid-session
// (different Wi-Fi, a VPN, a hotspot) changes both.
const POLL_INTERVAL_MS = 60_000;

export const useNetworkMeta = () =>
  usePolledFetch<NetworkMeta>("/api/network/meta", POLL_INTERVAL_MS, "Unable to read network location");
