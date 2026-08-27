// Pure IPv4 arithmetic, shared by anything that needs to reason about subnets
// (device discovery's host-range sweep, OS fingerprinting's scope check) —
// kept dependency-free so neither has to import the other for it.

export function ipToLong(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

export function longToIp(long: number): string {
  return [24, 16, 8, 0].map(shift => (long >>> shift) & 255).join(".");
}

/** Whether `ip` is in the same subnet as `localIp` under `mask` (e.g. both are on the same /24). */
export function isInSameSubnet(ip: string, localIp: string, mask: string): boolean {
  const maskLong = ipToLong(mask);
  return (ipToLong(ip) & maskLong) === (ipToLong(localIp) & maskLong);
}
