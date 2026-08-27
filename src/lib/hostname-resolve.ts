import dns from "dns";
import mdnsFactory from "multicast-dns";
import { isIpInLocalSubnet } from "./lan-scope";
import { queryNetbiosName } from "./netbios";

const DNS_TIMEOUT_MS = 800;
const NETBIOS_TIMEOUT_MS = 400;
const MDNS_TIMEOUT_MS = 600;

const mdns = mdnsFactory();
// An unhandled 'error' here (e.g. another process already owns the mDNS
// multicast socket) would otherwise crash the whole server — degrade to "no
// mDNS support" instead.
mdns.on("error", () => {});

// One persistent listener for the process's lifetime, dispatching to whichever
// query is waiting on that PTR name — not one listener per in-flight query,
// which would trip Node's max-listeners warning under the concurrency this
// runs at (several dozen devices resolved in parallel per scan).
const pendingMdnsQueries = new Map<string, (name: string | null) => void>();

mdns.on("response", (response: { answers: { type: string; name: string; data: unknown }[] }) => {
  for (const answer of response.answers) {
    if (answer.type !== "PTR") continue;
    pendingMdnsQueries.get(answer.name)?.(typeof answer.data === "string" ? answer.data.replace(/\.$/, "") : null);
  }
});

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
    const finish = (result: string | null) => {
      if (!pendingMdnsQueries.has(ptrName)) return; // already resolved by the shared listener, or timed out
      pendingMdnsQueries.delete(ptrName);
      clearTimeout(timer);
      resolve(result);
    };

    pendingMdnsQueries.set(ptrName, finish);
    const timer = setTimeout(() => finish(null), MDNS_TIMEOUT_MS);
    mdns.query({ questions: [{ name: ptrName, type: "PTR" }] });
  });
}

/**
 * Best-effort hostname for a LAN IP. Reverse DNS is tried first but rarely
 * works on a home network (the router would have to run its own DNS server
 * tracking PTR records for clients); NetBIOS and mDNS ask the device itself
 * instead, so they work regardless of router support. Each is only tried if
 * the previous one came up empty.
 */
async function resolveHostname(ip: string): Promise<string | null> {
  return (await resolveDnsPtr(ip)) ?? (await queryNetbiosName(ip, NETBIOS_TIMEOUT_MS)) ?? (await resolveMdnsName(ip));
}

export type HostnameLookupResult =
  | { status: "resolved"; hostname: string }
  | { status: "not_found" }
  | { status: "out_of_scope" };

/**
 * On-demand, single-device hostname lookup for the Devices page's per-row
 * "resolve name" action. The bulk discovery scan no longer resolves
 * hostnames automatically — running the full DNS/NetBIOS/mDNS chain for
 * every discovered device on every scan was the main reason the page was
 * slow to load — so this is how a name gets found for a device someone
 * actually wants to identify.
 */
export async function lookupDeviceHostname(ip: string): Promise<HostnameLookupResult> {
  if (!(await isIpInLocalSubnet(ip))) return { status: "out_of_scope" };
  const hostname = await resolveHostname(ip);
  return hostname ? { status: "resolved", hostname } : { status: "not_found" };
}
