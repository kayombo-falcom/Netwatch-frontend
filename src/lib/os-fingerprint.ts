import net from "net";
import { isIpInLocalSubnet } from "./lan-scope";
import { execFileAsync, pingOnce } from "./shell";

const REACHABILITY_TIMEOUT_MS = 500;
const NMAP_TIMEOUT_MS = 30_000;

// A device with its firewall up (the Windows default, and plenty of phones)
// silently drops ICMP echo requests while still being fully reachable — so a
// TCP probe is a second, independent liveness signal that doesn't depend on
// ICMP being allowed through. Even a refusal (RST) proves the host is alive:
// only a live device can send one.
const TCP_PROBE_PORTS = [80, 443, 445, 139, 3389, 22, 8080];
const TCP_PROBE_TIMEOUT_MS = 400;

// nmap reports an accuracy percentage per candidate OS match; below this, the
// fingerprint is too ambiguous to call it a match — report Unknown instead of
// surfacing a low-confidence guess as if it were a real detection.
const CONFIDENCE_THRESHOLD = 85;

const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;

export type OsDetectionResult =
  | { status: "detected"; osFamily: string; osName: string; osVersion: string | null; deviceType: string | null; confidence: number }
  | { status: "unknown"; confidence: number | null }
  | { status: "unreachable" }
  | { status: "out_of_scope" }
  | { status: "engine_unavailable"; reason: string };

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

/** Whether a TCP connection attempt to `port` proves the host is alive — connected or actively refused, either way something answered. */
function tcpProbe(ip: string, port: number): Promise<boolean> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    const finish = (result: boolean) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(TCP_PROBE_TIMEOUT_MS);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", (err: NodeJS.ErrnoException) => finish(err.code === "ECONNREFUSED"));
    socket.connect(port, ip);
  });
}

/** ICMP first (cheapest), then a handful of common TCP ports in parallel if that got no reply — a device can be fully reachable with ICMP simply blocked. */
async function isReachable(ip: string): Promise<boolean> {
  if ((await pingOnce(ip, REACHABILITY_TIMEOUT_MS)).alive) return true;

  const tcpResults = await Promise.all(TCP_PROBE_PORTS.map(port => tcpProbe(ip, port)));
  return tcpResults.some(Boolean);
}

/**
 * Active OS fingerprinting for a single device — standalone by design, with
 * no dependency on the device-discovery scan, storage, UI, or auth; it takes
 * an IP and returns one normalized result.
 *
 * Flow: reject anything outside the caller's own LAN (this route isn't
 * behind login, so it must not become an open scanning proxy for arbitrary
 * hosts), confirm the target is reachable, then run nmap's TCP/IP stack
 * fingerprinting (TTL, TCP window size/options, ICMP behavior, and
 * open/closed port responses evaluated together against its fingerprint
 * database — TTL is only ever one of those signals, never decisive alone),
 * and return its best match. A low-confidence match is reported as
 * `unknown` rather than guessed.
 */
export async function detectOs(ip: string): Promise<OsDetectionResult> {
  if (!IPV4_PATTERN.test(ip)) return { status: "engine_unavailable", reason: "Invalid IPv4 address" };

  if (!(await isIpInLocalSubnet(ip))) return { status: "out_of_scope" };

  if (!(await isReachable(ip))) return { status: "unreachable" };

  if (!(await isNmapAvailable())) {
    return { status: "engine_unavailable", reason: "OS detection engine is not available on this host" };
  }

  let stdout: string;
  try {
    // -Pn: we already confirmed reachability above, skip nmap's own host-discovery ping.
    // --max-os-tries 1: don't retry ambiguous probes; ambiguous should resolve to "unknown", not a slower retry loop.
    // --top-ports 100 / -T4: OS detection only needs one open + one closed port as reference
    // points, not nmap's default 1000-port survey — and a LAN target doesn't need nmap's
    // internet-scanning caution. Both are the main reason a scan was taking 30s+ and timing out.
    // --host-timeout: let nmap give up on an unresponsive host itself rather than us killing
    // the whole process externally with no partial info.
    ({ stdout } = await execFileAsync(
      "nmap", ["-O", "-Pn", "-T4", "--top-ports", "100", "--host-timeout", "20s", "--max-os-tries", "1", "-oX", "-", ip],
      { timeout: NMAP_TIMEOUT_MS }
    ));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("root privileges")) {
      return { status: "engine_unavailable", reason: "OS detection requires administrator privileges" };
    }
    if ((err as { killed?: boolean })?.killed) {
      return { status: "engine_unavailable", reason: "Scan timed out" };
    }
    return { status: "engine_unavailable", reason: "Scan failed" };
  }

  if (!hostIsUp(stdout)) return { status: "unreachable" };

  const best = parseBestOsMatch(stdout);
  if (!best || best.accuracy < CONFIDENCE_THRESHOLD) return { status: "unknown", confidence: best?.accuracy ?? null };

  return {
    status: "detected",
    osFamily: best.osFamily ?? best.name,
    osName: best.name,
    osVersion: best.osVersion,
    deviceType: best.deviceType,
    confidence: best.accuracy,
  };
}
