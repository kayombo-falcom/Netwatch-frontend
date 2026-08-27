import { NextResponse } from "next/server";
import { scanConnectedDevices } from "@/lib/devices";

// A live LAN scan (ping sweep + ARP table), so it must never be
// statically cached/optimized — every hit has to re-check.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await scanConnectedDevices();
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to scan the local network" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
