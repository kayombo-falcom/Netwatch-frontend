import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export type CurrentWifi = {
  connected: boolean;
  interfaceName: string | null;
  ssid: string | null;
  bssid: string | null;
  band: string | null;
  channel: string | null;
  radioType: string | null;
  authentication: string | null;
  signalPercent: number | null;
  rssiDbm: number | null;
  ip: string | null;
  subnet: string | null;
  gateway: string | null;
  mac: string | null;
};

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

export async function getCurrentWifi(): Promise<CurrentWifi> {
  const empty: CurrentWifi = {
    connected: false,
    interfaceName: null,
    ssid: null,
    bssid: null,
    band: null,
    channel: null,
    radioType: null,
    authentication: null,
    signalPercent: null,
    rssiDbm: null,
    ip: null,
    subnet: null,
    gateway: null,
    mac: null,
  };

  const wlan = await getWlanInterface();
  if (!wlan) return empty;

  const interfaceName = wlan["Name"] ?? null;
  const ip = interfaceName ? await getIpConfig(interfaceName) : null;

  const signalMatch = wlan["Signal"]?.match(/(\d+)%/);
  const subnetMatch = ip?.["Subnet Prefix"]?.match(/mask\s+([\d.]+)/);

  return {
    connected: true,
    interfaceName,
    ssid: wlan["SSID"] ?? null,
    bssid: wlan["AP BSSID"] ?? null,
    band: wlan["Band"] ?? null,
    channel: wlan["Channel"] ?? null,
    radioType: wlan["Radio type"] ?? null,
    authentication: wlan["Authentication"] ?? null,
    signalPercent: signalMatch ? Number(signalMatch[1]) : null,
    rssiDbm: wlan["Rssi"] ? Number(wlan["Rssi"]) : null,
    ip: ip?.["IP Address"] ?? null,
    subnet: subnetMatch ? subnetMatch[1] : null,
    gateway: ip?.["Default Gateway"] ?? null,
    mac: wlan["Physical address"] ?? null,
  };
}
