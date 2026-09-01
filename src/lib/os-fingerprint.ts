import net from "net";
import { isIpInLocalSubnet } from "./lan-scope";
import { getNetworkProvider } from "./platform";
import { execFileAsync } from "./shell";
import { collectBannerSignals, collectMdnsSignals, collectNetbiosSignal, collectOuiSignal, collectSsdpSignal, portSignals, ttlSignal, type OsFamily, type Signal } from "./os-signals";

const REACHABILITY_TIMEOUT_MS = 500;
const NMAP_TIMEOUT_MS = 30_000;

// A firewalled device (Windows default, many phones) drops ICMP but still
// answers TCP — even a refusal proves it's alive.
const TCP_PROBE_PORTS = [80, 443, 445, 139, 3389, 22, 8080];
const TCP_PROBE_TIMEOUT_MS = 400;

// A winning family needs at least this much total weight — one weak signal
// alone (e.g. just a TTL bucket) isn't enough to call it.
const MIN_TOTAL_WEIGHT = 3;
// ...and needs to clearly lead the runner-up, not just edge it out, or the
// result is too ambiguous to report as "detected".
const MIN_MARGIN_RATIO = 1.5;

const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

// Every real result here comes from remote network fingerprinting, never
// from asking the device itself — "estimated" always, until a self-reporting
// agent exists to produce a "verified" one instead.
export type DetectionMethod = "estimated" | "verified";

export type OsDetectionResult =
  | { status: "detected"; method: DetectionMethod; osFamily: string; osName: string; osVersion: string | null; deviceType: string | null; confidence: number; signals: SignalDetail[] }
  | { status: "unknown"; method: DetectionMethod; confidence: number | null; signals: SignalDetail[]; notes?: string[] }
  | { status: "unreachable" }
  | { status: "out_of_scope" }
  | { status: "engine_unavailable"; reason: string };

type SignalDetail = { source: string; detail: string };

function parseAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrPattern = /(\w+)="([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = attrPattern.exec(tag))) attrs[match[1]] = match[2];
  return attrs;
}

type OsMatch = { name: string; accuracy: number; deviceType: string | null; osFamily: string | null; osVersion: string | null };

/** Picks nmap's highest-accuracy `<osmatch>` from its XML report, pairing each with its nested `<osclass>` (family/version/device type). */
function parseBestOsMatch(xml: string): OsMatch | null {
  const osMatchPattern = /<osmatch\s+([^>]*?)\/?>([\s\S]*?)(?:<\/osmatch>|$)/g;
  let best: OsMatch | null = null;
  let matchTag: RegExpExecArray | null;

  while ((matchTag = osMatchPattern.exec(xml))) {
    const [, attrString, body] = matchTag;
    const attrs = parseAttributes(attrString);
    const accuracy = Number(attrs.accuracy);
    if (!attrs.name || Number.isNaN(accuracy)) continue;

    const osClassTag = body.match(/<osclass\s+([^>]*?)\/?>/);
    const osClassAttrs = osClassTag ? parseAttributes(osClassTag[1]) : {};

    const candidate: OsMatch = {
      name: attrs.name,
      accuracy,
      deviceType: osClassAttrs.type ?? null,
      osFamily: osClassAttrs.osfamily ?? null,
      osVersion: osClassAttrs.osgen ?? null,
    };

    if (!best || candidate.accuracy > best.accuracy) best = candidate;
  }

  return best;
}

function hostIsUp(xml: string): boolean {
  return /<status\s+state="up"/i.test(xml);
}

async function isNmapAvailable(): Promise<boolean> {
  return execFileAsync("nmap", ["--version"]).then(() => true).catch(() => false);
}

type TcpProbeResult = { alive: boolean; open: boolean };

/** A refusal proves the host is alive, but not that the port is open — only a real connect does. */
function tcpProbe(ip: string, port: number): Promise<TcpProbeResult> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    const finish = (result: TcpProbeResult) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(TCP_PROBE_TIMEOUT_MS);
    socket.once("connect", () => finish({ alive: true, open: true }));
    socket.once("timeout", () => finish({ alive: false, open: false }));
    socket.once("error", (err: NodeJS.ErrnoException) => finish({ alive: err.code === "ECONNREFUSED", open: false }));
    socket.connect(port, ip);
  });
}

/**
 * Runs ICMP and the TCP probes together rather than ICMP-then-fallback,
 * since which ports are open is itself a signal (see `portSignals`). Two
 * pings, not one — a single dropped Wi-Fi packet shouldn't mark a live
 * device unreachable. Scoped to this on-demand check only; the shared
 * `pingOnce` stays single-shot for the bulk subnet sweep, which needs to stay fast.
 */
async function checkReachability(ip: string): Promise<{ alive: boolean; ttl: number | null; openPorts: number[] }> {
  const provider = getNetworkProvider();
  const [ping1, ping2, tcpResults] = await Promise.all([
    provider.pingOnce(ip, REACHABILITY_TIMEOUT_MS),
    provider.pingOnce(ip, REACHABILITY_TIMEOUT_MS),
    Promise.all(TCP_PROBE_PORTS.map(port => tcpProbe(ip, port))),
  ]);

  const ping = ping1.alive ? ping1 : ping2;
  const openPorts = TCP_PROBE_PORTS.filter((_, i) => tcpResults[i].open);
  const tcpAlive = tcpResults.some(r => r.alive);
  return { alive: ping.alive || tcpAlive, ttl: ping.ttl, openPorts };
}

type NmapRun = { status: "ok"; xml: string } | { status: "error"; reason: string } | { status: "unavailable" };

/**
 * -Pn skips nmap's own ping (we already checked). --max-os-tries 2 /
 * --osscan-guess let nmap try a bit harder on an ambiguous fingerprint —
 * safe now that nmap is just one vote, not the final answer. --top-ports
 * 100 / -T4 keep it fast for a LAN scan instead of nmap's internet-scale
 * defaults. --host-timeout lets nmap give up cleanly instead of us killing it.
 */
async function runNmap(ip: string): Promise<NmapRun> {
  if (!(await isNmapAvailable())) return { status: "unavailable" };

  try {
    const { stdout } = await execFileAsync(
      "nmap",
      ["-O", "-Pn", "-T4", "--top-ports", "100", "--host-timeout", "20s", "--max-os-tries", "2", "--osscan-guess", "-oX", "-", ip],
      { timeout: NMAP_TIMEOUT_MS }
    );
    return { status: "ok", xml: stdout };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("root privileges")) return { status: "error", reason: "OS detection requires administrator privileges" };
    if ((err as { killed?: boolean })?.killed) return { status: "error", reason: "Scan timed out" };
    return { status: "error", reason: "Scan failed" };
  }
}

const NPCAP_MISSING_NOTE =
  "Npcap driver not detected — nmap needs it for raw-packet OS fingerprinting even when running as administrator. Reinstall nmap with the Npcap option checked, or install it separately from npcap.org.";

/** Maps nmap's free-text OS name to our canonical buckets. Device types like router/printer don't map to a family, so they get no vote. */
function normalizeFamily(raw: string): OsFamily | null {
  const lower = raw.toLowerCase();
  if (lower.includes("windows")) return "Windows";
  if (lower.includes("mac os") || lower === "macos") return "macOS";
  if (lower.includes("ios")) return "iOS";
  if (lower.includes("android")) return "Android";
  if (lower.includes("linux")) return "Linux";
  return null;
}

/** Sums each family's weight. The winner needs both a minimum total and a clear lead over the runner-up, so agreement between sources decides — not one engine's own confidence. */
function fuseSignals(signals: Signal[]): { family: OsFamily; confidence: number } | null {
  const totals = new Map<OsFamily, number>();
  for (const signal of signals) totals.set(signal.family, (totals.get(signal.family) ?? 0) + signal.weight);

  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return null;

  const [topFamily, topWeight] = ranked[0];
  const runnerUpWeight = ranked[1]?.[1] ?? 0;
  if (topWeight < MIN_TOTAL_WEIGHT) return null;
  if (runnerUpWeight > 0 && topWeight < runnerUpWeight * MIN_MARGIN_RATIO) return null;

  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);
  return { family: topFamily, confidence: Math.round((topWeight / totalWeight) * 100) };
}

/** Sorted strongest-first so the tooltip/API surfaces the most authoritative evidence up top — makes it obvious at a glance which signal is the outlier when sources disagree. */
function toSignalDetails(signals: Signal[], onlyFamily?: OsFamily): SignalDetail[] {
  return signals
    .filter(s => !onlyFamily || s.family === onlyFamily)
    .sort((a, b) => b.weight - a.weight)
    .map(({ source, detail }) => ({ source, detail }));
}

/**
 * Checks one device's OS on demand. Confirms it's on our own LAN and
 * reachable, then gathers several independent signals in parallel — nmap,
 * NetBIOS, banners, mDNS, SSDP, open ports, TTL, MAC vendor — and fuses them
 * into one verdict. No single signal decides alone. `mac`, when known, only
 * feeds the OUI vendor signal — everything else here is IP-addressed.
 */
export async function detectOs(ip: string, mac?: string): Promise<OsDetectionResult> {
  if (!IPV4_PATTERN.test(ip)) return { status: "engine_unavailable", reason: "Invalid IPv4 address" };

  if (!(await isIpInLocalSubnet(ip))) return { status: "out_of_scope" };

  const reachability = await checkReachability(ip);
  if (!reachability.alive) return { status: "unreachable" };

  const [nmapRun, netbiosSignal, bannerSignals, mdnsSignals, ssdpSignals] = await Promise.all([
    runNmap(ip),
    collectNetbiosSignal(ip),
    collectBannerSignals(ip),
    collectMdnsSignals(ip),
    collectSsdpSignal(ip),
  ]);

  const signals: Signal[] = [...bannerSignals, ...mdnsSignals, ...ssdpSignals, ...portSignals(reachability.openPorts)];
  if (netbiosSignal) signals.push(netbiosSignal);
  const ttl = ttlSignal(reachability.ttl);
  if (ttl) signals.push(ttl);
  const oui = collectOuiSignal(mac ?? null);
  if (oui) signals.push(oui);

  let nmapMatch: OsMatch | null = null;
  if (nmapRun.status === "ok" && hostIsUp(nmapRun.xml)) {
    nmapMatch = parseBestOsMatch(nmapRun.xml);
    if (nmapMatch) {
      const family = normalizeFamily(nmapMatch.osFamily ?? nmapMatch.name);
      if (family) signals.push({ source: "nmap", family, detail: nmapMatch.name, weight: nmapMatch.accuracy / 20 });
    }
  }

  const fused = fuseSignals(signals);
  if (fused) {
    const nmapAgrees = !!nmapMatch && normalizeFamily(nmapMatch.osFamily ?? nmapMatch.name) === fused.family;
    return {
      status: "detected",
      method: "estimated",
      osFamily: fused.family,
      osName: nmapAgrees ? nmapMatch!.name : fused.family,
      osVersion: nmapAgrees ? nmapMatch!.osVersion : null,
      deviceType: nmapAgrees ? nmapMatch!.deviceType : null,
      confidence: fused.confidence,
      signals: toSignalDetails(signals, fused.family),
    };
  }

  // Only fail outright if nothing came back at all — a device with no nmap
  // but a NetBIOS/mDNS reply should still show "unknown" with those signals,
  // not a hard error.
  if (signals.length === 0 && nmapRun.status !== "ok") {
    const reason = nmapRun.status === "error" ? nmapRun.reason : "OS detection engine is not available on this host";
    return { status: "engine_unavailable", reason };
  }

  // nmap ran and found the host up but named no OS — the classic sign
  // Npcap is missing, so check for it here.
  const notes: string[] = [];
  if (nmapRun.status === "ok" && !nmapMatch && !(await getNetworkProvider().isRawCaptureReady())) notes.push(NPCAP_MISSING_NOTE);

  return {
    status: "unknown",
    method: "estimated",
    confidence: nmapMatch?.accuracy ?? null,
    signals: toSignalDetails(signals),
    ...(notes.length ? { notes } : {}),
  };
}
