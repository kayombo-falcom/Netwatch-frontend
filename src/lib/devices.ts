import dns from "dns";
import os from "os";
import { execFileAsync, normalizeMac } from "./shell";
import { getCurrentConnection } from "./wifi";

// Ping sweeps and reverse-DNS lookups run one host at a time by default —
// this caps how many run concurrently so a /24 sweep finishes in a handful
// of rounds instead of one host at a time.
const PING_CONCURRENCY = 32;
const PING_TIMEOUT_MS = 300;
const HOSTNAME_CONCURRENCY = 16;
const HOSTNAME_TIMEOUT_MS = 800;

// Ping-sweeping a subnet bigger than this (a /23 or larger) would take an
// unreasonable amount of time and traffic, so above this size we fall back to
// reading whatever the OS's ARP cache already has instead of actively probing.
const MAX_HOSTS_TO_SWEEP = 512;

export type DiscoveredDevice = {
  ip: string;
  mac: string;
  hostname: string | null;
  os: string | null;
  isCurrentDevice: boolean;
};

export type NetworkScanResult = {
  localIp: string | null;
  subnetMask: string | null;
  devices: DiscoveredDevice[];
};

const EMPTY_RESULT: NetworkScanResult = { localIp: null, subnetMask: null, devices: [] };

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function longToIp(long: number): string {
  return [24, 16, 8, 0].map(shift => (long >>> shift) & 255).join(".");
}

/** Every usable host address between the network and broadcast address, or [] if the subnet is too large to sweep. */
function computeHostRange(localIp: string, mask: string): string[] {
  const maskLong = ipToLong(mask);
  const network = ipToLong(localIp) & maskLong;
  const broadcast = network | (~maskLong >>> 0);
  const hostCount = broadcast - network - 1;
  if (hostCount <= 0 || hostCount > MAX_HOSTS_TO_SWEEP) return [];

  const hosts: string[] = [];
  for (let host = network + 1; host < broadcast; host++) hosts.push(longToIp(host));
  return hosts;
}

/** Pings a host so a live device answers and populates the OS's ARP cache, returning the reply's TTL (for an OS guess) if it answered. */
async function pingHost(ip: string): Promise<number | null> {
  const { stdout } = await execFileAsync("ping", ["-n", "1", "-w", String(PING_TIMEOUT_MS), ip]).catch(() => ({ stdout: "" }));
  const match = stdout.match(/TTL=(\d+)/i);
  return match ? Number(match[1]) : null;
}

/**
 * Rough OS family from a ping's TTL: Windows, Linux/macOS/Android, and most
 * network gear each start from a different well-known default (128, 64, 255)
 * that only counts down per hop, so the smallest default at or above the
 * observed value is the best guess. It's not a fingerprint — Linux, macOS,
 * iOS, and Android all default to 64 and are indistinguishable this way.
 */
function guessOsFromTtl(ttl: number): string {
  if (ttl > 128) return "Network device";
  if (ttl > 64) return "Windows";
  return "Linux / macOS / Android";
}

/** Reads the OS ARP cache, keeping only "dynamic" entries — "static" rows are broadcast/multicast reservations, not real devices. */
async function readArpTable(localIp: string): Promise<{ ip: string; mac: string }[]> {
  const { stdout } = await execFileAsync("arp", ["-a", "-N", localIp]).catch(() => ({ stdout: "" }));
  const entries: { ip: string; mac: string }[] = [];

  for (const line of stdout.split("\n")) {
    const match = line.match(/^\s*(\d{1,3}(?:\.\d{1,3}){3})\s+([0-9a-fA-F]{2}(?:-[0-9a-fA-F]{2}){5})\s+dynamic\s*$/i);
    if (match) entries.push({ ip: match[1], mac: normalizeMac(match[2])! });
  }

  return entries;
}

async function resolveHostname(ip: string): Promise<string | null> {
  try {
    const names = await Promise.race([
      dns.promises.reverse(ip),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), HOSTNAME_TIMEOUT_MS)),
    ]);
    return names[0] ?? null;
  } catch {
    return null;
  }
}

/** Discovers devices on the currently joined network: a ping sweep to populate the ARP cache and guess OS family from TTL, then reverse-DNS for hostnames where available. */
export async function scanConnectedDevices(): Promise<NetworkScanResult> {
  const connection = await getCurrentConnection();
  if (!connection.connected || !connection.ip || !connection.subnet) return EMPTY_RESULT;

  const hosts = computeHostRange(connection.ip, connection.subnet);
  const ttls = hosts.length > 0 ? await mapWithConcurrency(hosts, PING_CONCURRENCY, pingHost) : [];
  const ttlByIp = new Map(hosts.map((ip, index) => [ip, ttls[index]]));

  const arpEntries = await readArpTable(connection.ip);

  const byIp = new Map<string, { mac: string; hostname: string | null; os: string | null; isCurrentDevice: boolean }>();
  if (connection.mac) {
    byIp.set(connection.ip, { mac: connection.mac, hostname: os.hostname(), os: os.platform() === "win32" ? "Windows" : null, isCurrentDevice: true });
  }
  for (const entry of arpEntries) {
    if (byIp.has(entry.ip)) continue;
    const ttl = ttlByIp.get(entry.ip);
    byIp.set(entry.ip, { mac: entry.mac, hostname: null, os: ttl != null ? guessOsFromTtl(ttl) : null, isCurrentDevice: false });
  }

  const entries = [...byIp.entries()];
  const hostnames = await mapWithConcurrency(entries, HOSTNAME_CONCURRENCY, async ([ip, device]) =>
    device.hostname ?? resolveHostname(ip)
  );

  const devices: DiscoveredDevice[] = entries
    .map(([ip, device], index) => ({ ip, mac: device.mac, hostname: hostnames[index], os: device.os, isCurrentDevice: device.isCurrentDevice }))
    .sort((a, b) => ipToLong(a.ip) - ipToLong(b.ip));

  return { localIp: connection.ip, subnetMask: connection.subnet, devices };
}
