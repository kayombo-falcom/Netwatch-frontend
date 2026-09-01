// What the app needs from the host OS, as one interface. Windows/Linux each
// implement it in their own file; ./index.ts picks the right one.

export type ConnectionKind = "wifi" | "ethernet";

export type CurrentConnection = {
  type: ConnectionKind | null;
  connected: boolean;
  interfaceName: string | null;
  networkName: string | null;
  bssid: string | null;
  band: string | null;
  channel: string | null;
  radioType: string | null;
  protocol: string | null;
  authentication: string | null;
  signalPercent: number | null;
  rssiDbm: number | null;
  receiveRateMbps: number | null;
  transmitRateMbps: number | null;
  description: string | null;
  manufacturer: string | null;
  driverVersion: string | null;
  ip: string | null;
  subnet: string | null;
  gateway: string | null;
  mac: string | null;
  linkLocalIPv6: string | null;
  dnsServers: string | null;
};

export const EMPTY_CONNECTION: CurrentConnection = {
  type: null,
  connected: false,
  interfaceName: null,
  networkName: null,
  bssid: null,
  band: null,
  channel: null,
  radioType: null,
  protocol: null,
  authentication: null,
  signalPercent: null,
  rssiDbm: null,
  receiveRateMbps: null,
  transmitRateMbps: null,
  description: null,
  manufacturer: null,
  driverVersion: null,
  ip: null,
  subnet: null,
  gateway: null,
  mac: null,
  linkLocalIPv6: null,
  dnsServers: null,
};

export type PingResult = { alive: boolean; ttl: number | null };
export type PacketLossResult = { sent: number; received: number; lossPercent: number };
export type NeighborEntry = { ip: string; mac: string };

export interface NetworkProvider {
  /** Live Wi-Fi/Ethernet status of whichever interface is carrying the default route. */
  getCurrentConnection(): Promise<CurrentConnection>;
  /** This host's ARP/neighbor table — MAC addresses already resolved on the LAN. */
  readNeighborTable(localIp: string): Promise<NeighborEntry[]>;
  /** One ICMP echo; used for both the bulk subnet sweep and on-demand reachability checks. */
  pingOnce(ip: string, timeoutMs: number): Promise<PingResult>;
  /** `count` pings in a single process, reading the OS's own summary line. */
  measurePacketLoss(target: string, count: number, timeoutMs: number): Promise<PacketLossResult | null>;
  /** Whether nmap can send raw packets for OS fingerprinting (checks Npcap on Windows). */
  isRawCaptureReady(): Promise<boolean>;
  /** This host's own OS name, for the device list. */
  currentDeviceOsLabel(): string;
}

const WIFI_GENERATION: Record<string, string> = {
  "802.11be": "Wi-Fi 7",
  "802.11ax": "Wi-Fi 6",
  "802.11ac": "Wi-Fi 5",
  "802.11n": "Wi-Fi 4",
};

/** "802.11ac" -> "Wi-Fi 5 (802.11ac)". Shared by both providers. */
export function getProtocolLabel(radioType: string | null): string | null {
  if (!radioType) return null;
  const generation = WIFI_GENERATION[radioType.toLowerCase()];
  return generation ? `${generation} (${radioType})` : radioType;
}
