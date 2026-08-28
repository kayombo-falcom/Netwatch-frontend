import dns from "dns";
import type { StringAnswer } from "dns-packet";
import { isIpInLocalSubnet } from "./lan-scope";
import { queryNetbiosName } from "./netbios";
import { subscribeMdns } from "./mdns-client";

const DNS_TIMEOUT_MS = 800;
const NETBIOS_TIMEOUT_MS = 400;
const MDNS_TIMEOUT_MS = 600;

/** Classic reverse DNS — only useful if the router runs a DNS server that tracks PTR records for LAN clients, which most consumer routers don't. */
function resolveDnsPtr(ip: string): Promise<string | null> {
  return Promise.race([
    dns.promises.reverse(ip).then(names => names[0] ?? null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), DNS_TIMEOUT_MS)),
  ]).catch(() => null);
}

/** mDNS (Bonjour) reverse-PTR query over multicast — asks the device directly, the main way Apple devices (and a growing number of Android/IoT ones) announce a name. */
function resolveMdnsName(ip: string): Promise<string | null> {
  const ptrName = `${ip.split(".").reverse().join(".")}.in-addr.arpa`;

  return new Promise(resolve => {
    const unsubscribe = subscribeMdns({ name: ptrName, type: "PTR" }, response => {
      const match = response.answers.find((a): a is StringAnswer => a.type === "PTR" && a.name === ptrName);
      if (match) finish(match.data.replace(/\.$/, ""));
    });

    const finish = (result: string | null) => {
      clearTimeout(timer);
      unsubscribe();
      resolve(result);
    };

    const timer = setTimeout(() => finish(null), MDNS_TIMEOUT_MS);
  });
}

/**
 * Best-effort hostname for a LAN IP. Reverse DNS rarely works on a home
 * network, so NetBIOS and mDNS ask the device itself instead. Each is only
 * tried if the previous one came up empty.
 */
async function resolveHostname(ip: string): Promise<string | null> {
  return (await resolveDnsPtr(ip)) ?? (await queryNetbiosName(ip, NETBIOS_TIMEOUT_MS)) ?? (await resolveMdnsName(ip));
}

export type HostnameLookupResult =
  | { status: "resolved"; hostname: string }
  | { status: "not_found" }
  | { status: "out_of_scope" };

/**
 * On-demand hostname lookup for the Devices page's "resolve name" button.
 * The bulk scan doesn't do this automatically — running the full chain for
 * every device was why the page used to load slowly.
 */
export async function lookupDeviceHostname(ip: string): Promise<HostnameLookupResult> {
  if (!(await isIpInLocalSubnet(ip))) return { status: "out_of_scope" };
  const hostname = await resolveHostname(ip);
  return hostname ? { status: "resolved", hostname } : { status: "not_found" };
}
