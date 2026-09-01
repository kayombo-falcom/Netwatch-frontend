import os from "os";
import { ipToLong, longToIp } from "./ip";
import { getNetworkProvider } from "./platform";

// Ping sweeps run one host at a time by default — this caps how many run
// concurrently so a /24 sweep finishes in a handful of rounds instead of one
// host at a time.
const PING_CONCURRENCY = 32;
const PING_TIMEOUT_MS = 300;

// Ping-sweeping a subnet bigger than this (a /23 or larger) would take an
// unreasonable amount of time and traffic, so above this size we fall back to
// reading whatever the OS's ARP cache already has instead of actively probing.
const MAX_HOSTS_TO_SWEEP = 512;

// The OS's ARP table has no join-time info — Windows returns it sorted by IP,
// not by recency — so "last joined at the top" has no source of truth to read
// from. This is the closest honest substitute: the first time this running
// server ever notices a MAC, in memory only. It resets on restart and can't
// reflect anyone who joined before this process started.
const firstSeenAtByMac = new Map<string, number>();

function trackFirstSeen(mac: string): number {
  const seenAt = firstSeenAtByMac.get(mac);
  if (seenAt !== undefined) return seenAt;
  const now = Date.now();
  firstSeenAtByMac.set(mac, now);
  return now;
}

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
  return (await getNetworkProvider().pingOnce(ip, PING_TIMEOUT_MS)).ttl;
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

/**
 * Discovers devices on the currently joined network: a ping sweep to
 * populate the ARP cache and guess OS family from TTL. Hostnames are *not*
 * resolved here — running the full DNS/NetBIOS/mDNS chain (hostname-resolve.ts)
 * for every device on every scan was the main reason this was slow to load;
 * that's now an on-demand per-device lookup instead. Returned
 * most-recently-first-seen first.
 */
export async function scanConnectedDevices(): Promise<NetworkScanResult> {
  const provider = getNetworkProvider();
  const connection = await provider.getCurrentConnection();
  if (!connection.connected || !connection.ip || !connection.subnet) return EMPTY_RESULT;

  const hosts = computeHostRange(connection.ip, connection.subnet);
  const ttls = hosts.length > 0 ? await mapWithConcurrency(hosts, PING_CONCURRENCY, pingHost) : [];
  const ttlByIp = new Map(hosts.map((ip, index) => [ip, ttls[index]]));

  const arpEntries = await provider.readNeighborTable(connection.ip);

  const byIp = new Map<string, { mac: string; hostname: string | null; os: string | null; isCurrentDevice: boolean }>();
  if (connection.mac) {
    byIp.set(connection.ip, { mac: connection.mac, hostname: os.hostname(), os: provider.currentDeviceOsLabel(), isCurrentDevice: true });
  }
  for (const entry of arpEntries) {
    if (byIp.has(entry.ip)) continue;
    const ttl = ttlByIp.get(entry.ip);
    byIp.set(entry.ip, { mac: entry.mac, hostname: null, os: ttl != null ? guessOsFromTtl(ttl) : null, isCurrentDevice: false });
  }

  const devices: DiscoveredDevice[] = [...byIp.entries()]
    .map(([ip, device]) => ({ ip, mac: device.mac, hostname: device.hostname, os: device.os, isCurrentDevice: device.isCurrentDevice }))
    .map(device => ({ device, firstSeenAt: trackFirstSeen(device.mac) }))
    .sort((a, b) => b.firstSeenAt - a.firstSeenAt)
    .map(({ device }) => device);

  return { localIp: connection.ip, subnetMask: connection.subnet, devices };
}
