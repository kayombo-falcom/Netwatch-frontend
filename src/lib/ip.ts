/** Dotted mask (e.g. 255.255.255.0) to its CIDR prefix length (e.g. 24), for display alongside an IP. */
export function maskToCidr(mask: string): number {
  let bits = mask.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
  let count = 0;
  while (bits) {
    count += bits & 1;
    bits >>>= 1;
  }
  return count;
}
