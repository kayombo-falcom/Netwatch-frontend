import { execFileAsync, normalizeMac, runPowerShell } from "./shell";

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

const EMPTY_CONNECTION: CurrentConnection = {
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

const WIFI_GENERATION: Record<string, string> = {
  "802.11be": "Wi-Fi 7",
  "802.11ax": "Wi-Fi 6",
  "802.11ac": "Wi-Fi 5",
  "802.11n": "Wi-Fi 4",
};

function getProtocolLabel(radioType: string | null): string | null {
  if (!radioType) return null;
  const generation = WIFI_GENERATION[radioType.toLowerCase()];
  return generation ? `${generation} (${radioType})` : radioType;
}

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
  const { stdout } = await execFileAsync("netsh", ["wlan", "show", "interfaces"]);
  if (!/State\s*:\s*connected/i.test(stdout)) return null;
  return parseColonFields(stdout);
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
  const script = `
$adapter = Get-NetAdapter -Physical -ErrorAction SilentlyContinue | Where-Object { $_.Status -eq 'Up' -and $_.PhysicalMediaType -eq '802.3' } | Select-Object -First 1
if (-not $adapter) { exit }
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

export async function getCurrentConnection(): Promise<CurrentConnection> {
  const wlan = await getWlanInterface();
  if (wlan) return buildWifiConnection(wlan);

  const ethernet = await getActiveEthernetAdapter();
  if (ethernet) return buildEthernetConnection(ethernet);

  return EMPTY_CONNECTION;
}
