"use client";

import type { NetworkMeta } from "@/lib/network-types";
import { usePolledFetch } from "./use-polled-fetch";

// Polled less often than link stats, but still periodically since switching networks mid-session changes it.
const POLL_INTERVAL_MS = 60_000;

export const useNetworkMeta = () =>
  usePolledFetch<NetworkMeta>("/api/network/meta", POLL_INTERVAL_MS, "Unable to read network location");
