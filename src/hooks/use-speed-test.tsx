"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SpeedTest, { type MeasurementConfig } from "@cloudflare/speedtest";

/**
 * Cloudflare's own default measurement sequence, minus `packetLoss` (needs a
 * TURN server we don't have — measured separately below instead). The large
 * download/upload tiers matter for accuracy, not just speed: the engine only
 * escalates to a bigger tier once the current one finishes fast, so on a
 * fast connection (fiber, gigabit) the small tiers never reach steady-state
 * throughput — only the 25MB+ tiers do. Trimming them, as this used to,
 * makes the test finish quicker but understates real speed on fast links.
 * The UI shows elapsed time during the run so a longer test doesn't read as
 * a stuck button.
 */
const MEASUREMENTS: MeasurementConfig[] = [
  { type: "latency", numPackets: 1 },
  { type: "download", bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: "latency", numPackets: 20 },
  { type: "download", bytes: 1e5, count: 9 },
  { type: "download", bytes: 1e6, count: 8 },
  { type: "upload", bytes: 1e5, count: 8 },
  { type: "upload", bytes: 1e6, count: 6 },
  { type: "download", bytes: 1e7, count: 6 },
  { type: "upload", bytes: 1e7, count: 4 },
  { type: "download", bytes: 2.5e7, count: 4 },
  { type: "upload", bytes: 2.5e7, count: 4 },
  { type: "download", bytes: 1e8, count: 3 },
  { type: "upload", bytes: 5e7, count: 3 },
  { type: "download", bytes: 2.5e8, count: 2 },
];

/**
 * Safety net: cancel if the engine goes silent — no phase change, no results
 * update — for this long. Measured from last *activity*, not total run time,
 * so a connection that's slow but still making progress (e.g. a slow upload
 * round) is never punished for taking a while; only genuine stalls trip it.
 * Raised from 15s now that the largest tier (250MB) can take a while on its
 * own on a merely-decent (not fast) connection.
 */
const INACTIVITY_TIMEOUT_MS = 30_000;
const WATCHDOG_INTERVAL_MS = 2_000;

export type SpeedTestStatus = "idle" | "running" | "done" | "error";
export type SpeedTestPhase = "latency" | "download" | "upload";

export type SpeedTestSummary = {
  downloadMbps: number | null;
  uploadMbps: number | null;
  latencyMs: number | null;
  jitterMs: number | null;
};

// Cloudflare's own packetLoss measurement needs a TURN relay this app has no
// server for (it fails with "unable to get TURN server credentials" even
// with credentials fetched fresh — the endpoint is gated to Cloudflare's own
// site, confirmed by a direct 403). Measured separately instead, via a batch
// of ICMP pings server-side (`/api/network/packet-loss`) run alongside the
// engine rather than through it.
export type PacketLossState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; percent: number }
  | { status: "error" };

function toMbps(bps: number | undefined): number | null {
  return bps != null ? Math.round((bps / 1e6) * 10) / 10 : null;
}

function toSummary(engine: SpeedTest): SpeedTestSummary {
  const summary = engine.results.getSummary();
  return {
    downloadMbps: toMbps(summary.download),
    uploadMbps: toMbps(summary.upload),
    latencyMs: summary.latency != null ? Math.round(summary.latency) : null,
    jitterMs: summary.jitter != null ? Math.round(summary.jitter) : null,
  };
}

/** Single on-demand speed test run — `run()` performs exactly one measurement cycle, no auto-repeat. */
export const useSpeedTest = () => {
  const [status, setStatus] = useState<SpeedTestStatus>("idle");
  const [phase, setPhase] = useState<SpeedTestPhase | null>(null);
  const [summary, setSummary] = useState<SpeedTestSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [packetLoss, setPacketLoss] = useState<PacketLossState>({ status: "idle" });
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const engineRef = useRef<InstanceType<typeof SpeedTest> | null>(null);
  const lastActivityRef = useRef(0);
  const startedAtRef = useRef(0);

  const run = useCallback(() => {
    setStatus("running");
    setError(null);
    setSummary(null);
    setPhase(null);
    setElapsedSeconds(0);
    startedAtRef.current = Date.now();
    lastActivityRef.current = Date.now();

    // Independent of the engine below — its own ~10s ping batch, not one of
    // the engine's measurement phases, so it doesn't block or extend them.
    setPacketLoss({ status: "loading" });
    fetch("/api/network/packet-loss", { cache: "no-store" })
      .then(res => res.json())
      .then((reading: { lossPercent: number } | null) =>
        setPacketLoss(reading ? { status: "done", percent: reading.lossPercent } : { status: "error" })
      )
      .catch(() => setPacketLoss({ status: "error" }));

    // logAimApiUrl disabled: this is a local network monitoring tool, results
    // shouldn't be reported to Cloudflare's aggregate insights endpoint.
    const engine = new SpeedTest({ autoStart: false, logAimApiUrl: null, measurements: MEASUREMENTS });
    engineRef.current = engine;

    engine.onPhaseChange = ({ measurement }) => {
      lastActivityRef.current = Date.now();
      if (measurement.type === "latency" || measurement.type === "download" || measurement.type === "upload") {
        setPhase(measurement.type);
      }
    };
    engine.onResultsChange = () => {
      lastActivityRef.current = Date.now();
      setSummary(toSummary(engine));
    };
    engine.onFinish = () => {
      setSummary(toSummary(engine));
      setStatus("done");
    };
    engine.onError = (message) => {
      setError(message);
      setStatus("error");
    };

    engine.play();
  }, []);

  const cancel = useCallback(() => {
    engineRef.current?.pause();
    setStatus("idle");
    setPhase(null);
  }, []);

  const toggle = useCallback(() => {
    if (status === "running") cancel();
    else run();
  }, [status, run, cancel]);

  // If the engine goes silent for INACTIVITY_TIMEOUT_MS (a stalled request, a
  // browser quirk), the button would otherwise be stuck on "Cancel" forever
  // since nothing else flips `status` back. Polls activity rather than
  // setting one long timer so a slow-but-progressing test is never punished.
  useEffect(() => {
    if (status !== "running") return;
    const watchdog = setInterval(() => {
      if (Date.now() - lastActivityRef.current > INACTIVITY_TIMEOUT_MS) {
        engineRef.current?.pause();
        setError("Speed test stalled — no response from the server");
        setStatus("error");
      }
    }, WATCHDOG_INTERVAL_MS);
    return () => clearInterval(watchdog);
  }, [status]);

  // Ticks the elapsed-time display while running, so a longer test (now that
  // the large tiers are back) reads as progress instead of a stuck button.
  useEffect(() => {
    if (status !== "running") return;
    const tick = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(tick);
  }, [status]);

  return { status, phase, summary, error, packetLoss, elapsedSeconds, run, cancel, toggle };
};
