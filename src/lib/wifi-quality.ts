/** Signal strength (%) quality bands. */
export function signalQuality(signalPercent: number): { label: string; colorClass: string } {
  if (signalPercent >= 90) return { label: "Excellent", colorClass: "bg-green-500" };
  if (signalPercent >= 70) return { label: "Good", colorClass: "bg-green-500" };
  if (signalPercent >= 50) return { label: "Fair", colorClass: "bg-yellow-500" };
  if (signalPercent >= 30) return { label: "Poor", colorClass: "bg-orange-500" };
  return { label: "Very Poor", colorClass: "bg-red-500" };
}

/** Standard RSSI (dBm) signal-quality bands used across Wi-Fi tooling. */
export function rssiQuality(rssiDbm: number): { label: string; colorClass: string } {
  if (rssiDbm >= -50) return { label: "Excellent", colorClass: "bg-green-500" };
  if (rssiDbm >= -67) return { label: "Good", colorClass: "bg-green-500" };
  if (rssiDbm >= -70) return { label: "Fair", colorClass: "bg-yellow-500" };
  if (rssiDbm >= -80) return { label: "Poor", colorClass: "bg-orange-500" };
  return { label: "Very poor", colorClass: "bg-red-500" };
}

/** Standard latency (ms) quality bands for interactive/real-time use. */
export function pingQuality(latencyMs: number): { label: string; colorClass: string } {
  if (latencyMs < 20) return { label: "Excellent", colorClass: "bg-green-500" };
  if (latencyMs <= 50) return { label: "Good", colorClass: "bg-green-500" };
  if (latencyMs <= 100) return { label: "Acceptable", colorClass: "bg-yellow-500" };
  if (latencyMs <= 200) return { label: "High", colorClass: "bg-orange-500" };
  return { label: "Poor", colorClass: "bg-red-500" };
}

/** Standard jitter (ms) quality bands — how much ping varies call to call. */
export function jitterQuality(jitterMs: number): { label: string; colorClass: string } {
  if (jitterMs < 5) return { label: "Excellent", colorClass: "bg-green-500" };
  if (jitterMs <= 10) return { label: "Good", colorClass: "bg-green-500" };
  if (jitterMs <= 20) return { label: "Acceptable", colorClass: "bg-yellow-500" };
  if (jitterMs <= 30) return { label: "Poor", colorClass: "bg-orange-500" };
  return { label: "Very poor", colorClass: "bg-red-500" };
}

/**
 * Negotiated link-rate (Mbps) quality bands for everyday use — not tied to
 * any specific Wi-Fi generation, just "is this ceiling fast enough for
 * typical activity." This is the radio's negotiated ceiling, not achieved
 * throughput (that's the Speed Test's Download/Upload dials).
 */
export function linkRateQuality(mbps: number): { label: string; colorClass: string } {
  if (mbps >= 300) return { label: "Excellent", colorClass: "bg-green-500" };
  if (mbps >= 150) return { label: "Good", colorClass: "bg-green-500" };
  if (mbps >= 50) return { label: "Fair", colorClass: "bg-yellow-500" };
  if (mbps >= 10) return { label: "Poor", colorClass: "bg-orange-500" };
  return { label: "Very Poor", colorClass: "bg-red-500" };
}

/**
 * Wi-Fi band characteristics. Not a quality scale — no band is objectively
 * "better," each trades range for speed/interference differently — so this
 * is informational only, not paired with a colored dot like the others.
 */
export function bandInfo(band: string): string | null {
  if (band.startsWith("2.4")) return "Longer range — better coverage, more interference";
  if (band.startsWith("5")) return "Medium range — faster, less interference";
  if (band.startsWith("6")) return "Shorter range — fastest, least interference";
  return null;
}
