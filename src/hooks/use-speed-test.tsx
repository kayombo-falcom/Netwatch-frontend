"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import SpeedTest, { type MeasurementConfig } from "@cloudflare/speedtest";

/**
 * Default engine sequence, trimmed down: the `packetLoss` phase is dropped
 * (it needs a TURN server we don't have, so it always fails with "unable to
 * get TURN server credentials"), and the largest download/upload rounds are
 * dropped or shrunk. The full default sequence transfers close to a
 * gigabyte, which on an ordinary connection can take minutes — long enough
 * that "still running, only Cancel is available" looks like a stuck button
 * rather than a test in progress. This finishes in a few seconds instead.
 */
const MEASUREMENTS: MeasurementConfig[] = [
  { type: "latency", numPackets: 1 },
  { type: "download", bytes: 1e5, count: 1, bypassMinDuration: true },
  { type: "latency", numPackets: 10 },
  { type: "download", bytes: 1e5, count: 5 },
  { type: "download", bytes: 1e6, count: 5 },
  { type: "upload", bytes: 1e5, count: 5 },
  { type: "upload", bytes: 1e6, count: 4 },
  { type: "download", bytes: 1e7, count: 4 },
  { type: "upload", bytes: 1e7, count: 3 },
  { type: "download", bytes: 2.5e7, count: 3 },
  { type: "upload", bytes: 2.5e7, count: 2 },
  { type: "download", bytes: 1e8, count: 2 },
];

/**
 * Safety net: cancel if the engine goes silent — no phase change, no results
 * update — for this long. Measured from last *activity*, not total run time,
 * so a connection that's slow but still making progress (e.g. a slow upload
 * round) is never punished for taking a while; only genuine stalls trip it.
 */
const INACTIVITY_TIMEOUT_MS = 15_000;
const WATCHDOG_INTERVAL_MS = 2_000;

export type SpeedTestStatus = "idle" | "running" | "done" | "error";
export type SpeedTestPhase = "latency" | "download" | "upload";

export type SpeedTestSummary = {
  downloadMbps: number | null;
  uploadMbps: number | null;
  latencyMs: number | null;
  jitterMs: number | null;
};

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
  const engineRef = useRef<InstanceType<typeof SpeedTest> | null>(null);
  const lastActivityRef = useRef(0);

  const run = useCallback(() => {
    setStatus("running");
    setError(null);
    setSummary(null);
    setPhase(null);
    lastActivityRef.current = Date.now();

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

  return { status, phase, summary, error, run, cancel, toggle };
};
