/**
 * ASN → consumer brand name overrides.
 *
 * IP geolocation providers report the ISP's legal/registry name (from ASN
 * WHOIS records), which is often outdated or unrecognizable — e.g. ASN 15399
 * resolves to "Wananchi Cable Tanzania" even though the retail brand on the
 * router and the bill is "Zuku". Add entries here as they come up; unknown
 * ASNs just fall back to the raw registry name.
 */
export const ISP_BRAND_BY_ASN: Record<number, string> = {
  15399: "Zuku",
};

export function brandNameForIsp(asn: number | null | undefined, registryName: string | null): string | null {
  if (asn != null && ISP_BRAND_BY_ASN[asn]) return ISP_BRAND_BY_ASN[asn];
  return registryName;
}
