import net from "net";
import type { Answer } from "dns-packet";
import { subscribeMdns } from "./mdns-client";
import { queryNetbiosName } from "./netbios";
import { querySsdp } from "./ssdp";

const NETBIOS_PRESENCE_TIMEOUT_MS = 400;
const BANNER_TIMEOUT_MS = 800;
const BANNER_MAX_BYTES = 512;
const MDNS_ENRICH_TIMEOUT_MS = 600;
const SSDP_TIMEOUT_MS = 1500;

// The canonical OS buckets every signal source normalizes into, so they can
// be summed against each other regardless of where they came from.
export type OsFamily = "Windows" | "Linux" | "macOS" | "iOS" | "Android" | "Network device";

export type Signal = { source: string; family: OsFamily; detail: string; weight: number };

/** Answering NBNS at all almost always means Windows (rarely Samba on Linux). */
export async function collectNetbiosSignal(ip: string): Promise<Signal | null> {
  const name = await queryNetbiosName(ip, NETBIOS_PRESENCE_TIMEOUT_MS);
  return name ? { source: "netbios", family: "Windows", detail: `Responded to NetBIOS name service as "${name}"`, weight: 3 } : null;
}

// A device's MAC vendor (OUI, its first 3 bytes) only counts as an OS signal
// when that vendor makes single-purpose hardware for one OS — most vendors
// (Dell, Intel, TP-Link, etc.) sell chips/boards that run anything, so
// they're deliberately left out rather than guessed. Kept small and correct
// on purpose: a short list of vendors we're actually sure about beats a long
// one that's half wrong.
const OUI_FAMILY_HINTS: Record<string, { vendor: string; family: OsFamily }> = {
  "b8:27:eb": { vendor: "Raspberry Pi Foundation", family: "Linux" },
  "dc:a6:32": { vendor: "Raspberry Pi Foundation", family: "Linux" },
  "e4:5f:01": { vendor: "Raspberry Pi Foundation", family: "Linux" },
};

/** MAC vendor as a weak OS hint — only for vendors whose hardware only ever runs one OS. */
export function collectOuiSignal(mac: string | null): Signal | null {
  if (!mac) return null;
  const oui = mac.toLowerCase().slice(0, 8);
  const hint = OUI_FAMILY_HINTS[oui];
  return hint ? { source: "oui", family: hint.family, detail: `MAC vendor: ${hint.vendor}`, weight: 2 } : null;
}

/** Connects to `port`, optionally sends `probe` once connected, and returns whatever text comes back before the timeout (nothing received = null). */
function grabBanner(ip: string, port: number, probe?: string): Promise<string | null> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    let data = "";

    const finish = (result: string | null) => {
      socket.destroy();
      resolve(result);
    };

    socket.setTimeout(BANNER_TIMEOUT_MS);
    socket.once("connect", () => { if (probe) socket.write(probe); });
    socket.on("data", chunk => {
      data += chunk.toString("utf8");
      if (data.length >= BANNER_MAX_BYTES) finish(data);
    });
    socket.once("timeout", () => finish(data || null));
    socket.once("error", () => finish(data || null));
    socket.connect(port, ip);
  });
}

const LINUX_DISTRO_PATTERN = /(Ubuntu|Debian|Raspbian|CentOS|Fedora|Alpine|openSUSE)/i;

/** SSH sends its identification banner unprompted (RFC 4253). Only a distro-tagged banner (e.g. "OpenSSH_8.9p1 Ubuntu-3ubuntu0.10") is unambiguous — a bare "OpenSSH_x.y" is just as common on macOS, so it isn't voted on. */
function classifySshBanner(banner: string): Signal | null {
  const distro = banner.match(LINUX_DISTRO_PATTERN)?.[1];
  return distro ? { source: "ssh-banner", family: "Linux", detail: `SSH banner names ${distro}`, weight: 4 } : null;
}

/** HTTP `Server:` header — only voted on when it names an OS/distro explicitly; a bare "nginx"/"Apache" runs on every platform and isn't decisive. */
function classifyHttpBanner(banner: string): Signal | null {
  const server = banner.match(/^Server:\s*(.+)$/im)?.[1]?.trim();
  if (!server) return null;
  if (/Microsoft-IIS/i.test(server)) return { source: "http-banner", family: "Windows", detail: `Server header: ${server}`, weight: 3 };
  const distro = server.match(LINUX_DISTRO_PATTERN)?.[1];
  return distro ? { source: "http-banner", family: "Linux", detail: `Server header: ${server}`, weight: 3 } : null;
}

/** SSH (22) and an HTTP `Server:` header (80) — the two ports that hand back a plain-text banner without any protocol negotiation. SMB's banner is a binary handshake and isn't worth the complexity here. */
export async function collectBannerSignals(ip: string): Promise<Signal[]> {
  const [ssh, http] = await Promise.all([
    grabBanner(ip, 22).then(b => (b ? classifySshBanner(b) : null)),
    grabBanner(ip, 80, `GET / HTTP/1.0\r\nHost: ${ip}\r\n\r\n`).then(b => (b ? classifyHttpBanner(b) : null)),
  ]);
  return [ssh, http].filter((s): s is Signal => s !== null);
}

/** SSDP's `SERVER:` header is more standardized than HTTP's, so it's trusted for Android/macOS too, not just Windows/Linux. */
function classifySsdpServer(server: string): Signal | null {
  if (/android/i.test(server)) return { source: "ssdp-server", family: "Android", detail: `SSDP SERVER header: ${server}`, weight: 3 };
  if (/windows/i.test(server)) return { source: "ssdp-server", family: "Windows", detail: `SSDP SERVER header: ${server}`, weight: 3 };
  if (/mac os|darwin/i.test(server)) return { source: "ssdp-server", family: "macOS", detail: `SSDP SERVER header: ${server}`, weight: 3 };
  const distro = server.match(LINUX_DISTRO_PATTERN)?.[1];
  return distro ? { source: "ssdp-server", family: "Linux", detail: `SSDP SERVER header names ${distro}`, weight: 3 } : null;
}

/** SSDP (UPnP) M-SEARCH — a different discovery protocol than mDNS, answered by some Android phones and most smart-TV/media/IoT devices even when mDNS is silent. */
export async function collectSsdpSignal(ip: string): Promise<Signal[]> {
  const response = await querySsdp(ip, SSDP_TIMEOUT_MS);
  const server = response?.headers["SERVER"];
  if (!server) return [];
  const signal = classifySsdpServer(server);
  return signal ? [signal] : [];
}

function familyFromAppleModel(model: string): OsFamily {
  return /^(iPhone|iPad|iPod)/.test(model) ? "iOS" : "macOS";
}

/**
 * Asks for `serviceType` and matches a reply to `ip` via its A record —
 * mDNS bundles SRV/TXT/A together, so one query both confirms the service
 * and reads its TXT `model=`. Matching within a single packet (not across
 * all replies) matters: several devices can answer the same broadcast, and
 * mixing one device's A record with another's TXT would misattribute the model.
 */
function queryMdnsServiceForIp(serviceType: string, ip: string, timeoutMs: number): Promise<{ present: boolean; model: string | null }> {
  return new Promise(resolve => {
    const unsubscribe = subscribeMdns({ name: serviceType, type: "PTR" }, response => {
      const additionals = response.additionals;
      if (!additionals.some(a => a.type === "A" && a.data === ip)) return;

      const txt = additionals.find((a): a is Answer & { type: "TXT" } => a.type === "TXT");
      const model = txt ? extractTxtModel(txt.data) : null;
      finish({ present: true, model });
    });

    const finish = (result: { present: boolean; model: string | null }) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(result);
    };

    const timer = setTimeout(() => finish({ present: false, model: null }), timeoutMs);
  });
}

function extractTxtModel(data: string | Buffer | Array<string | Buffer>): string | null {
  const entries = Array.isArray(data) ? data : [data];
  for (const entry of entries) {
    const text = Buffer.isBuffer(entry) ? entry.toString("utf8") : entry;
    const match = text.match(/^model=(.+)$/);
    if (match) return match[1];
  }
  return null;
}

const DEVICE_INFO_SERVICE = "_device-info._tcp.local";

/**
 * mDNS/Bonjour enrichment. `_device-info._tcp` gives an Apple device's real
 * model — the strongest non-nmap signal we have. `_smb`/`_googlecast` are
 * kept as weak hints only; AirPlay/HomeKit are left out since they can't
 * tell macOS, iOS, and tvOS apart.
 */
export async function collectMdnsSignals(ip: string): Promise<Signal[]> {
  const [deviceInfo, smb, cast] = await Promise.all([
    queryMdnsServiceForIp(DEVICE_INFO_SERVICE, ip, MDNS_ENRICH_TIMEOUT_MS),
    queryMdnsServiceForIp("_smb._tcp.local", ip, MDNS_ENRICH_TIMEOUT_MS),
    queryMdnsServiceForIp("_googlecast._tcp.local", ip, MDNS_ENRICH_TIMEOUT_MS),
  ]);

  const signals: Signal[] = [];
  if (deviceInfo.present) {
    const family = deviceInfo.model ? familyFromAppleModel(deviceInfo.model) : "macOS";
    signals.push({
      source: "mdns-device-info",
      family,
      detail: deviceInfo.model ?? "Advertises Apple device-info service",
      weight: deviceInfo.model ? 5 : 3,
    });
  }
  if (smb.present) signals.push({ source: "mdns-smb", family: "Windows", detail: "Advertises SMB file sharing", weight: 1 });
  if (cast.present) signals.push({ source: "mdns-googlecast", family: "Android", detail: "Advertises Google Cast", weight: 1 });
  return signals;
}

/** Weakest fallback signal — reused from the passive bulk-scan bucket, but only voted when it isn't ambiguous: 64-or-under TTL is shared by Linux, macOS, and Android, so it contributes nothing there rather than guessing. */
export function ttlSignal(ttl: number | null): Signal | null {
  if (ttl == null) return null;
  if (ttl > 128) return { source: "ttl", family: "Network device", detail: `Ping TTL ${ttl}`, weight: 0.5 };
  if (ttl > 64) return { source: "ttl", family: "Windows", detail: `Ping TTL ${ttl}`, weight: 0.5 };
  return null;
}

/** Which of the already-probed liveness ports are open is itself weak OS evidence — RDP in particular is close to Windows-exclusive by default. */
export function portSignals(openPorts: number[]): Signal[] {
  const signals: Signal[] = [];
  if (openPorts.includes(3389)) signals.push({ source: "port-3389", family: "Windows", detail: "RDP port open", weight: 2 });
  if (openPorts.includes(445) && openPorts.includes(139)) {
    signals.push({ source: "port-smb", family: "Windows", detail: "SMB ports 445+139 open", weight: 1 });
  }
  return signals;
}
