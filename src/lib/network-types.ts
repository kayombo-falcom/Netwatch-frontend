// Response shapes for the Django network endpoints (Netwach-backend/network/) —
// no logic here, just the JSON contract the proxies in src/app/api/network/
// pass through untouched.

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

export type DetectionMethod = "estimated" | "verified";

export type SignalDetail = { source: string; detail: string };

export type OsDetectionResult =
  | { status: "detected"; method: DetectionMethod; osFamily: string; osName: string; osVersion: string | null; deviceType: string | null; confidence: number; signals: SignalDetail[] }
  | { status: "unknown"; method: DetectionMethod; confidence: number | null; signals: SignalDetail[]; notes?: string[] }
  | { status: "unreachable" }
  | { status: "out_of_scope" }
  | { status: "engine_unavailable"; reason: string };

export type HostnameLookupResult =
  | { status: "resolved"; hostname: string }
  | { status: "not_found" }
  | { status: "out_of_scope" };

export type PacketLossResult = { sent: number; received: number; lossPercent: number };

export type NetworkMeta = {
  isp: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  publicIp: string | null;
};
