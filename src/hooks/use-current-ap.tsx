"use client";

import type { CurrentConnection } from "@/lib/network-types";
import { usePolledFetch } from "./use-polled-fetch";

const POLL_INTERVAL_MS = 10_000;

export const useCurrentAp = () =>
  usePolledFetch<CurrentConnection>("/api/network/current", POLL_INTERVAL_MS, "Unable to read network status on this host");
