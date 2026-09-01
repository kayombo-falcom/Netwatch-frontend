import { execFileAsync, normalizeMac, runPowerShell } from "../shell";
import { EMPTY_CONNECTION, getProtocolLabel, type CurrentConnection, type NetworkProvider, type NeighborEntry, type PacketLossResult, type PingResult } from "./types";

function parseLinkSpeedMbps(linkSpeed: string | null): number | null {
  if (!linkSpeed) return null;
  const match = linkSpeed.match(/([\d.]+)\s*(Gbps|Mbps|Kbps)/i);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "gbps") return value * 1000;
  if (unit === "kbps") return value / 1000;
  return value;
}

function parseColonFields(output: string): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const line of output.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fields[key] = value;
  }
  return fields;
}

async function getWlanInterface(): Promise<Record<string, string> | null> {
  // On a wired-only host (no Wi-Fi adapter, or the WLAN AutoConfig service
  // isn't running — the default on most desktops/servers) this command exits
  // non-zero and throws. That must not stop the Ethernet fallback below.
  try {
    const { stdout } = await execFileAsync("netsh", ["wlan", "show", "interfaces"]);
    if (!/State\s*:\s*connected/i.test(stdout)) return null;
    return parseColonFields(stdout);
  } catch {
    return null;
  }
}

async function getIpConfig(interfaceName: string): Promise<Record<string, string> | null> {
  const { stdout } = await execFileAsync("netsh", ["interface", "ip", "show", "config", interfaceName]);
  const blockStart = stdout.indexOf(`"${interfaceName}"`);
  if (blockStart === -1) return null;
  return parseColonFields(stdout.slice(blockStart));
}

function getIpFields(ip: Record<string, string> | null) {
  const subnetMatch = ip?.["Subnet Prefix"]?.match(/mask\s+([\d.]+)/);
  return {
    ip: ip?.["IP Address"] ?? null,
    subnet: subnetMatch ? subnetMatch[1] : null,
    gateway: ip?.["Default Gateway"] ?? null,
    dnsServers: ip?.["DNS servers configured through DHCP"] ?? ip?.["Statically Configured DNS Servers"] ?? null,
  };
}

type AdapterExtras = {
  manufacturer: string | null;
  driverVersion: string | null;
  linkLocalIPv6: string | null;
  networkName: string | null;
};

async function getAdapterExtras(interfaceName: string): Promise<AdapterExtras> {
  const empty: AdapterExtras = { manufacturer: null, driverVersion: null, linkLocalIPv6: null, networkName: null };
  const escapedName = interfaceName.replace(/'/g, "''");
  const script = `
$name = '${escapedName}'
$adapter = Get-NetAdapter -Name $name -ErrorAction SilentlyContinue
$manufacturer = (Get-CimInstance Win32_NetworkAdapter -Filter "NetConnectionID='$name'" -ErrorAction SilentlyContinue).Manufacturer
$ipv6 = (Get-NetIPAddress -InterfaceAlias $name -AddressFamily IPv6 -ErrorAction SilentlyContinue | Where-Object { $_.PrefixOrigin -eq 'WellKnown' } | Select-Object -First 1).IPAddress
$profileName = (Get-NetConnectionProfile -InterfaceAlias $name -ErrorAction SilentlyContinue | Select-Object -First 1).Name
[PSCustomObject]@{ DriverVersion = $adapter.DriverVersion; Manufacturer = $manufacturer; LinkLocalIPv6 = $ipv6; NetworkName = $profileName } | ConvertTo-Json -Compress
`;

  const parsed = await runPowerShell<{ DriverVersion?: string; Manufacturer?: string; LinkLocalIPv6?: string; NetworkName?: string }>(script);
  if (!parsed) return empty;
  return {
    manufacturer: parsed.Manufacturer ?? null,
    driverVersion: parsed.DriverVersion ?? null,
    linkLocalIPv6: parsed.LinkLocalIPv6 ?? null,
    networkName: parsed.NetworkName ?? null,
  };
}

async function buildWifiConnection(wlan: Record<string, string>): Promise<CurrentConnection> {
  const interfaceName = wlan["Name"] ?? null;
  const [ip, extras] = await Promise.all([
    interfaceName ? getIpConfig(interfaceName) : Promise.resolve(null),
    interfaceName ? getAdapterExtras(interfaceName) : Promise.resolve({ manufacturer: null, driverVersion: null, linkLocalIPv6: null, networkName: null }),
  ]);

  const signalMatch = wlan["Signal"]?.match(/(\d+)%/);
  const radioType = wlan["Radio type"] ?? null;

  return {
    ...EMPTY_CONNECTION,
    type: "wifi",
    connected: true,
    interfaceName,
    networkName: wlan["SSID"] ?? null,
    bssid: wlan["AP BSSID"] ?? null,
    band: wlan["Band"] ?? null,
    channel: wlan["Channel"] ?? null,
    radioType,
    protocol: getProtocolLabel(radioType),
    authentication: wlan["Authentication"] ?? null,
    signalPercent: signalMatch ? Number(signalMatch[1]) : null,
    rssiDbm: wlan["Rssi"] ? Number(wlan["Rssi"]) : null,
    receiveRateMbps: wlan["Receive rate (Mbps)"] ? Number(wlan["Receive rate (Mbps)"]) : null,
    transmitRateMbps: wlan["Transmit rate (Mbps)"] ? Number(wlan["Transmit rate (Mbps)"]) : null,
    description: wlan["Description"] ?? null,
    manufacturer: extras.manufacturer,
    driverVersion: extras.driverVersion,
    mac: normalizeMac(wlan["Physical address"] ?? null),
    linkLocalIPv6: extras.linkLocalIPv6,
    ...getIpFields(ip),
  };
}

type ActiveEthernetAdapter = {
  Name: string;
  Description: string | null;
  MacAddress: string | null;
  LinkSpeed: string | null;
  Manufacturer: string | null;
  DriverVersion: string | null;
  LinkLocalIPv6: string | null;
  NetworkName: string | null;
};

async function getActiveEthernetAdapter(): Promise<ActiveEthernetAdapter | null> {
  // Classifying adapters by driver-reported flags (InterfaceType,
  // PhysicalMediaType, ConnectorPresent, Virtual) is a dead end — vendors
  // set these inconsistently, so any single flag can miss a real wired NIC.
  // Ask Windows directly which adapter is carrying the default route instead
  // — that's the one actually in use, Ethernet or not, no guessing needed.
  const script = `
$config = Get-NetIPConfiguration -ErrorAction SilentlyContinue | Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq 'Up' } | Select-Object -First 1
if (-not $config) { exit }
$adapter = $config.NetAdapter
$name = $adapter.Name
$manufacturer = (Get-CimInstance Win32_NetworkAdapter -Filter "NetConnectionID='$name'" -ErrorAction SilentlyContinue).Manufacturer
$ipv6 = (Get-NetIPAddress -InterfaceAlias $name -AddressFamily IPv6 -ErrorAction SilentlyContinue | Where-Object { $_.PrefixOrigin -eq 'WellKnown' } | Select-Object -First 1).IPAddress
$profileName = (Get-NetConnectionProfile -InterfaceAlias $name -ErrorAction SilentlyContinue | Select-Object -First 1).Name
[PSCustomObject]@{
  Name = $name
  Description = $adapter.InterfaceDescription
  MacAddress = $adapter.MacAddress
  LinkSpeed = $adapter.LinkSpeed
  Manufacturer = $manufacturer
  DriverVersion = $adapter.DriverVersion
  LinkLocalIPv6 = $ipv6
  NetworkName = $profileName
} | ConvertTo-Json -Compress
`;

  return runPowerShell<ActiveEthernetAdapter>(script);
}

async function buildEthernetConnection(adapter: ActiveEthernetAdapter): Promise<CurrentConnection> {
  const ip = await getIpConfig(adapter.Name);
  const linkSpeedMbps = parseLinkSpeedMbps(adapter.LinkSpeed);

  return {
    ...EMPTY_CONNECTION,
    type: "ethernet",
    connected: true,
    interfaceName: adapter.Name,
    networkName: adapter.NetworkName ?? null,
    receiveRateMbps: linkSpeedMbps,
    transmitRateMbps: linkSpeedMbps,
    description: adapter.Description ?? null,
    manufacturer: adapter.Manufacturer ?? null,
    driverVersion: adapter.DriverVersion ?? null,
    mac: normalizeMac(adapter.MacAddress ?? null),
    linkLocalIPv6: adapter.LinkLocalIPv6 ?? null,
    ...getIpFields(ip),
  };
}

async function getCurrentConnection(): Promise<CurrentConnection> {
  const wlan = await getWlanInterface();
  if (wlan) return buildWifiConnection(wlan);

  const ethernet = await getActiveEthernetAdapter();
  if (ethernet) return buildEthernetConnection(ethernet);

  return EMPTY_CONNECTION;
}

/** Reads the ARP cache, keeping only "dynamic" entries — "static" rows are broadcast/multicast reservations, not real devices. */
async function readNeighborTable(localIp: string): Promise<NeighborEntry[]> {
  const { stdout } = await execFileAsync("arp", ["-a", "-N", localIp]).catch(() => ({ stdout: "" }));
  const entries: NeighborEntry[] = [];

  for (const line of stdout.split("\n")) {
    const match = line.match(/^\s*(\d{1,3}(?:\.\d{1,3}){3})\s+([0-9a-fA-F]{2}(?:-[0-9a-fA-F]{2}){5})\s+dynamic\s*$/i);
    if (match) entries.push({ ip: match[1], mac: normalizeMac(match[2])! });
  }

  return entries;
}

async function pingOnce(ip: string, timeoutMs: number): Promise<PingResult> {
  const { stdout } = await execFileAsync("ping", ["-n", "1", "-w", String(timeoutMs), ip]).catch(() => ({ stdout: "" }));
  const match = stdout.match(/TTL=(\d+)/i);
  return { alive: match !== null, ttl: match ? Number(match[1]) : null };
}

/**
 * Sends `count` pings in one call and reads Windows' own summary line,
 * rather than looping `pingOnce` — one process instead of `count` of them.
 * At 100% loss `ping` exits non-zero, so the summary is read off the error too.
 */
async function measurePacketLoss(target: string, count: number, timeoutMs: number): Promise<PacketLossResult | null> {
  const stdout = await execFileAsync("ping", ["-n", String(count), "-w", String(timeoutMs), target])
    .then(r => r.stdout)
    .catch((err: NodeJS.ErrnoException & { stdout?: string }) => err.stdout ?? "");

  const match = stdout.match(/Sent = (\d+), Received = (\d+), Lost = (\d+) \((\d+)% loss\)/i);
  return match ? { sent: Number(match[1]), received: Number(match[2]), lossPercent: Number(match[4]) } : null;
}

/** Without Npcap, nmap runs fine but can't send the raw packets `-O` needs — checked only when nmap ran but found no match, since that's the tell. */
async function isRawCaptureReady(): Promise<boolean> {
  const result = await runPowerShell<{ Status?: number | string }>(
    "Get-Service -Name npcap -ErrorAction SilentlyContinue | Select-Object Status | ConvertTo-Json -Compress"
  );
  return String(result?.Status ?? "") === "Running" || String(result?.Status ?? "") === "4";
}

function currentDeviceOsLabel(): string {
  return "Windows";
}

export const windowsProvider: NetworkProvider = {
  getCurrentConnection,
  readNeighborTable,
  pingOnce,
  measurePacketLoss,
  isRawCaptureReady,
  currentDeviceOsLabel,
};
