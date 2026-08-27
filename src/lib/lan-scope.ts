import { isInSameSubnet } from "./ip";
import { getCurrentConnection } from "./wifi";

/**
 * Whether `ip` is on the same subnet as this host's current connection — the
 * gate every unauthenticated on-demand network-probing route needs (OS
 * detection, hostname lookup, ...), so a request can't be pointed at an
 * arbitrary external host instead of a device actually on this LAN.
 */
export async function isIpInLocalSubnet(ip: string): Promise<boolean> {
  const connection = await getCurrentConnection();
  return !!connection.ip && !!connection.subnet && isInSameSubnet(ip, connection.ip, connection.subnet);
}
