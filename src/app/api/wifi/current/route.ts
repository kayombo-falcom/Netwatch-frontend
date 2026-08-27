import { NextResponse } from "next/server";
import { getCurrentConnection } from "@/lib/wifi";

// This reads live host state via child_process (netsh/PowerShell), which gives
// Next.js no signal that the route is dynamic — without this it can get
// statically cached in a production build and freeze on the first snapshot.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const connection = await getCurrentConnection();
    return NextResponse.json(connection, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: "Unable to read network status on this host" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
