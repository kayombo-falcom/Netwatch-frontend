"use client";

import { useCallback, useRef, useState } from "react";
import SpeedTest, { type MeasurementConfig } from "@cloudflare/speedtest";

/**
 * Default engine sequence minus the `packetLoss` phase — that phase needs a
 * TURN server (turnServerCredsApiUrl/user/pass), which isn't configured here,
 * so it always fails with "unable to get TURN server credentials" and would
 * abort the whole test. Packet loss isn't shown in this UI anyway.
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

  const run = useCallback(() => {
    setStatus("running");
    setError(null);
    setSummary(null);
    setPhase(null);

    // logAimApiUrl disabled: this is a local network monitoring tool, results
    // shouldn't be reported to Cloudflare's aggregate insights endpoint.
    const engine = new SpeedTest({ autoStart: false, logAimApiUrl: null, measurements: MEASUREMENTS });
    engineRef.current = engine;

    engine.onPhaseChange = ({ measurement }) => {
      if (measurement.type === "latency" || measurement.type === "download" || measurement.type === "upload") {
        setPhase(measurement.type);
      }
    };
    engine.onResultsChange = () => setSummary(toSummary(engine));
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

  return { status, phase, summary, error, run, cancel, toggle };
};
