import { NextResponse } from "next/server";
import { brandNameForIsp } from "@/lib/isp-brands";

// This depends on which network the request actually travels over, so it
// must never be statically cached/optimized — every hit has to re-check.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export type NetworkMeta = {
  isp: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  publicIp: string | null;
};

export async function GET() {
  try {
    const res = await fetch("https://speed.cloudflare.com/meta", {
      headers: {
        // Cloudflare's meta endpoint rejects requests that look like bare bot
        // traffic (default fetch/curl UA, or a cross-origin `Origin` header).
        // A browser UA + same-site Referer is what its own speed test page sends.
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": "https://speed.cloudflare.com/",
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("request failed");

    const data = await res.json();
    const meta: NetworkMeta = {
      isp: brandNameForIsp(data.asn ?? null, data.asOrganization ?? null),
      city: data.city ?? null,
      region: data.region ?? null,
      country: data.country ?? null,
      publicIp: data.clientIp ?? null,
    };
    return NextResponse.json(meta, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to read network location" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
