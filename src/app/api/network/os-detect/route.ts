import { NextResponse } from "next/server";
import { detectOs } from "@/lib/os-fingerprint";

// Runs a live nmap scan against the requested host, so it must never be
// statically cached/optimized — every hit has to re-check.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const ip = new URL(request.url).searchParams.get("ip");
  if (!ip) {
    return NextResponse.json(
      { error: 'Missing required "ip" query parameter' },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const result = await detectOs(ip);
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to run OS detection" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
