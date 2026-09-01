import fs from "fs";
import { cidrToMask } from "../ip";
import { execFileAsync, normalizeMac, runJson } from "../shell";
import { EMPTY_CONNECTION, getProtocolLabel, type CurrentConnection, type NetworkProvider, type NeighborEntry, type PacketLossResult, type PingResult } from "./types";

// No PowerShell/netsh equivalent exists on Linux, so this reads the same
// facts straight from iproute2's JSON output, iw, and sysfs instead.

type LinuxRoute = { dst: string; gateway?: string; dev: string; prefsrc?: string };
type LinuxAddrInfo = { family: string; local: string; prefixlen: number; scope: string };
type LinuxAddrShow = { ifname: string; address?: string; addr_info: LinuxAddrInfo[] };

async function getDefaultRoute(): Promise<LinuxRoute | null> {
  const routes = await runJson<LinuxRoute[]>("ip", ["-j", "route", "show", "default"]);
  return routes?.[0] ?? null;
}

async function getAddrInfo(dev: string): Promise<LinuxAddrShow | null> {
  const shown = await runJson<LinuxAddrShow[]>("ip", ["-j", "addr", "show", "dev", dev]);
  return shown?.[0] ?? null;
}

/** The presence of a `wireless` subdirectory is the standard, driver-independent way the kernel marks a Wi-Fi interface — no `iw`/`nmcli` guessing needed. */
function isWirelessInterface(dev: string): boolean {
  try {
    return fs.statSync(`/sys/class/net/${dev}/wireless`).isDirectory();
  } catch {
    return false;
  }
}

function readSysfsNumber(path: string): number | null {
  try {
    const value = Number(fs.readFileSync(path, "utf8").trim());
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function readSysfsString(path: string): string | null {
  try {
    return fs.readFileSync(path, "utf8").trim() || null;
  } catch {
    return null;
  }
}

function resolveDnsServers(): string | null {
  const servers = readSysfsString("/etc/resolv.conf")
    ?.split("\n")
    .map(line => line.match(/^\s*nameserver\s+(\S+)/)?.[1])
    .filter((s): s is string => !!s);
  return servers?.length ? servers.join(", ") : null;
}

function ipFieldsFromAddr(addr: LinuxAddrShow | null, route: LinuxRoute) {
  const inet = addr?.addr_info.find(a => a.family === "inet");
  const inet6 = addr?.addr_info.find(a => a.family === "inet6" && a.scope === "link");
  return {
    ip: inet?.local ?? route.prefsrc ?? null,
    subnet: inet ? cidrToMask(inet.prefixlen) : null,
    gateway: route.gateway ?? null,
    linkLocalIPv6: inet6?.local ?? null,
    dnsServers: resolveDnsServers(),
  };
}

/** IEEE 802.11 channel + band from a frequency reported in MHz (2.4/5/6 GHz plans each use a different offset). */
function freqToBandChannel(freqMhz: number): { band: string; channel: string } {
  if (freqMhz === 2484) return { band: "2.4 GHz", channel: "14" };
  if (freqMhz >= 2412 && freqMhz <= 2472) return { band: "2.4 GHz", channel: String(Math.round((freqMhz - 2407) / 5)) };
  if (freqMhz >= 5000 && freqMhz < 5900) return { band: "5 GHz", channel: String(Math.round((freqMhz - 5000) / 5)) };
  if (freqMhz >= 5925 && freqMhz <= 7125) return { band: "6 GHz", channel: String(Math.round((freqMhz - 5950) / 5)) };
  return { band: `${(freqMhz / 1000).toFixed(1)} GHz`, channel: "" };
}

/** `iw` reports dBm only, no percent — this is the same linear approximation NetworkManager uses (−100 dBm → 0%, −50 dBm or better → 100%). */
function rssiToPercent(rssiDbm: number): number {
  return Math.max(0, Math.min(100, 2 * (rssiDbm + 100)));
}

/** The bitrate line's MCS-scheme prefix is the only place `iw` names the Wi-Fi generation — a bare "MCS" with no VHT/HE/EHT prefix means 802.11n. */
function radioTypeFromBitrateLine(line: string | null): string | null {
  if (!line) return null;
  if (/EHT-MCS/i.test(line)) return "802.11be";
  if (/HE-MCS/i.test(line)) return "802.11ax";
  if (/VHT-MCS/i.test(line)) return "802.11ac";
  if (/\bMCS\b/i.test(line)) return "802.11n";
  return null;
}

async function buildWifiConnection(dev: string, route: LinuxRoute, addr: LinuxAddrShow | null): Promise<CurrentConnection> {
  const [linkOut, stationOut] = await Promise.all([
    execFileAsync("iw", ["dev", dev, "link"]).then(r => r.stdout).catch(() => ""),
    execFileAsync("iw", ["dev", dev, "station", "dump"]).then(r => r.stdout).catch(() => ""),
  ]);

  const bssid = linkOut.match(/Connected to ([0-9a-f:]{17})/i)?.[1] ?? null;
  const ssid = linkOut.match(/SSID:\s*(.+)/)?.[1]?.trim() ?? null;
  const freqMhz = linkOut.match(/freq:\s*(\d+)/)?.[1];
  const { band, channel } = freqMhz ? freqToBandChannel(Number(freqMhz)) : { band: null, channel: null };

  const signalDbm = stationOut.match(/^\s*signal:\s*(-?\d+)/m)?.[1] ?? null;
  const txLine = stationOut.match(/^\s*tx bitrate:\s*(.+)$/m)?.[1] ?? null;
  const rxLine = stationOut.match(/^\s*rx bitrate:\s*(.+)$/m)?.[1] ?? null;
  const rssiDbm = signalDbm ? Number(signalDbm) : null;
  const radioType = radioTypeFromBitrateLine(txLine ?? rxLine);

  return {
    ...EMPTY_CONNECTION,
    type: "wifi",
    connected: true,
    interfaceName: dev,
    networkName: ssid,
    bssid,
    band,
    channel,
    radioType,
    protocol: getProtocolLabel(radioType),
    signalPercent: rssiDbm != null ? Math.round(rssiToPercent(rssiDbm)) : null,
    rssiDbm,
    receiveRateMbps: rxLine ? Number(rxLine.match(/^([\d.]+)/)?.[1] ?? NaN) || null : null,
    transmitRateMbps: txLine ? Number(txLine.match(/^([\d.]+)/)?.[1] ?? NaN) || null : null,
    mac: normalizeMac(addr?.address ?? null),
    ...ipFieldsFromAddr(addr, route),
  };
}

async function getEthtoolDriverInfo(dev: string): Promise<{ driver: string; version: string | null } | null> {
  const { stdout } = await execFileAsync("ethtool", ["-i", dev]).catch(() => ({ stdout: "" }));
  const driver = stdout.match(/^driver:\s*(.+)$/m)?.[1]?.trim();
  const version = stdout.match(/^version:\s*(.+)$/m)?.[1]?.trim();
  return driver ? { driver, version: version || null } : null;
}

async function buildEthernetConnection(dev: string, route: LinuxRoute, addr: LinuxAddrShow | null): Promise<CurrentConnection> {
  const [speedMbps, duplex, driverInfo] = await Promise.all([
    Promise.resolve(readSysfsNumber(`/sys/class/net/${dev}/speed`)),
    Promise.resolve(readSysfsString(`/sys/class/net/${dev}/duplex`)),
    getEthtoolDriverInfo(dev),
  ]);

  return {
    ...EMPTY_CONNECTION,
    type: "ethernet",
    connected: true,
    interfaceName: dev,
    receiveRateMbps: speedMbps,
    transmitRateMbps: speedMbps,
    description: driverInfo ? `${driverInfo.driver} driver${duplex ? ` (${duplex}-duplex)` : ""}` : null,
    driverVersion: driverInfo?.version ?? null,
    mac: normalizeMac(addr?.address ?? null),
    ...ipFieldsFromAddr(addr, route),
  };
}

async function getCurrentConnection(): Promise<CurrentConnection> {
  const route = await getDefaultRoute();
  if (!route) return EMPTY_CONNECTION;

  const addr = await getAddrInfo(route.dev);
  return isWirelessInterface(route.dev)
    ? buildWifiConnection(route.dev, route, addr)
    : buildEthernetConnection(route.dev, route, addr);
}

type LinuxNeighEntry = { dst: string; lladdr?: string; state: string[] };

/** The neighbor table (ARP cache equivalent) via iproute2 — entries still resolving ("INCOMPLETE") or that gave up ("FAILED") have no `lladdr` and are skipped, same as excluding Windows' non-"dynamic" rows. */
async function readNeighborTable(): Promise<NeighborEntry[]> {
  const neighbors = await runJson<LinuxNeighEntry[]>("ip", ["-j", "neigh", "show"]);
  return (neighbors ?? [])
    .filter((n): n is LinuxNeighEntry & { lladdr: string } => !!n.lladdr)
    .map(n => ({ ip: n.dst, mac: normalizeMac(n.lladdr)! }));
}

/** `ping` argv for one run — iputils' `-W` is whole seconds, and 0 is rejected by older versions, so round up with a 1s floor. */
function pingArgs(target: string, count: number, timeoutMs: number): string[] {
  const timeoutSec = Math.max(1, Math.ceil(timeoutMs / 1000));
  return ["-c", String(count), "-W", String(timeoutSec), target];
}

async function pingOnce(ip: string, timeoutMs: number): Promise<PingResult> {
  const { stdout } = await execFileAsync("ping", pingArgs(ip, 1, timeoutMs)).catch(() => ({ stdout: "" }));
  const match = stdout.match(/ttl=(\d+)/i);
  return { alive: match !== null, ttl: match ? Number(match[1]) : null };
}

/**
 * Sends `count` pings in one call and reads iputils' own summary line,
 * rather than looping `pingOnce` — one process instead of `count` of them.
 * At 100% loss `ping` exits non-zero, so the summary is read off the error too.
 */
async function measurePacketLoss(target: string, count: number, timeoutMs: number): Promise<PacketLossResult | null> {
  const stdout = await execFileAsync("ping", pingArgs(target, count, timeoutMs))
    .then(r => r.stdout)
    .catch((err: NodeJS.ErrnoException & { stdout?: string }) => err.stdout ?? "");

  // "4 packets transmitted, 4 received, 0% packet loss, time 3003ms"
  const match = stdout.match(/(\d+) packets transmitted, (\d+) (?:packets )?received,.*?([\d.]+)% packet loss/i);
  return match ? { sent: Number(match[1]), received: Number(match[2]), lossPercent: Number(match[3]) } : null;
}

/** Linux nmap uses libpcap directly — no separate driver like Npcap to be missing. If nmap ran with root/CAP_NET_RAW, raw capture is already working. */
async function isRawCaptureReady(): Promise<boolean> {
  return true;
}

function currentDeviceOsLabel(): string {
  return "Linux";
}

export const linuxProvider: NetworkProvider = {
  getCurrentConnection,
  readNeighborTable,
  pingOnce,
  measurePacketLoss,
  isRawCaptureReady,
  currentDeviceOsLabel,
};
