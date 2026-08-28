import { NextResponse } from "next/server";
import { measureConnectionPacketLoss } from "@/lib/packet-loss";

// Runs a live batch of pings, so it must never be statically cached/optimized.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const result = await measureConnectionPacketLoss();
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to measure packet loss" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
