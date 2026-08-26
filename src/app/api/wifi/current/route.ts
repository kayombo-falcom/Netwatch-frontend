import { NextResponse } from "next/server";
import { getCurrentConnection } from "@/lib/wifi";

export async function GET() {
  try {
    const connection = await getCurrentConnection();
    return NextResponse.json(connection);
  } catch {
    return NextResponse.json(
      { error: "Unable to read network status on this host" },
      { status: 500 }
    );
  }
}
